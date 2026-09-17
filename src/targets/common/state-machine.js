// Generic single-page-app "state machine" engine shared across targets.
const { logMessage } = require("../common/log-message");
//
// Many target pages never change URL once loaded (Angular/React apps that
// swap views internally), so a URL-based route handler alone can't tell which
// view is currently on screen. Each such handler declares its "views" as a
// map of state name -> marker, where a marker is one of:
//   - a CSS selector string (matches when that element is visible)
//   - { selector, content } (visible AND its trimmed textContent matches)
//   - an async function (page) => boolean, for anything more custom
//
// detectionOrder controls which state wins when more than one marker matches
// at once (e.g. an earlier step's markup can stay mounted-but-hidden after a
// later step opens) - list the most-advanced state first.

async function matchesMarker(page, marker) {
  if (typeof marker === "function") {
    try {
      return Boolean(await marker(page));
    } catch {
      return false;
    }
  }

  const { selector, content } =
    typeof marker === "string" ? { selector: marker, content: undefined } : marker;

  return page
    .evaluate(
      (sel, expectedContent) => {
        const el = document.querySelector(sel);
        if (!el) {
          return false;
        }
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0;
        if (!isVisible) {
          return false;
        }
        if (!expectedContent) {
          return true;
        }
        const expectedContents = Array.isArray(expectedContent)
          ? expectedContent
          : [expectedContent];
        return expectedContents.includes((el.textContent || "").trim());
      },
      selector,
      content,
    )
    .catch(() => false);
}

async function detectState(page, markersByState, detectionOrder) {
  for (const state of detectionOrder) {
    if (await matchesMarker(page, markersByState[state])) {
      if (state !== "completed") {
        logMessage({
          icon: "✨",
          english: `Great progress! We've reached the "${state}" step and everything is moving forward smoothly.`,
          arabic: `تقدم رائع! وصلنا إلى خطوة "${state}" وكل شيء يسير بسلاسة.`,
          depth: 1,
        });
      }
      return state;
    }
  }
  return null;
}

// Polls for whichever state is actually rendered right now.
async function waitForState(
  page,
  markersByState,
  detectionOrder,
  { timeoutMs = 30000, pollMs = 300, shouldContinue } = {},
) {
  const deadline = Date.now() + timeoutMs;
  do {
    if (
      typeof shouldContinue === "function" &&
      !(await shouldContinue())
    ) {
      return null;
    }

    const state = await detectState(page, markersByState, detectionOrder);
    if (state) {
      return state;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  } while (Date.now() < deadline);
  return null;
}

function getPageUrl(page) {
  try {
    return typeof page?.url === "function" ? page.url() : "";
  } catch {
    return "";
  }
}

function matchesRouteConfig(page, routeConfig) {
  const currentUrl = getPageUrl(page);
  if (!currentUrl || !routeConfig) {
    return false;
  }

  if (routeConfig.url) {
    try {
      const actual = new URL(currentUrl);
      const expected = new URL(routeConfig.url);
      const normalizePath = (pathname) => pathname.replace(/\/+$/, "");
      return (
        actual.origin.toLowerCase() === expected.origin.toLowerCase() &&
        normalizePath(actual.pathname).toLowerCase() ===
          normalizePath(expected.pathname).toLowerCase()
      );
    } catch {
      return false;
    }
  }

  if (routeConfig.regex) {
    try {
      return new RegExp(routeConfig.regex, "i").test(currentUrl);
    } catch {
      return false;
    }
  }

  return false;
}

async function ensureStateChanged({
  previousState,
  currentState,
  onUnchanged,
}) {
  if (!previousState || previousState !== currentState) {
    return true;
  }

  const reason = `State did not change from "${previousState}" after its handler completed`;
  if (typeof onUnchanged === "function") {
    await onUnchanged(reason);
  }
  return false;
}

// Lets a handler's click/submit finish reacting (XHRs, re-render) before the
// next state-detection pass runs, instead of guessing with a fixed delay.
async function waitForPageSettled(page, { idleTimeMs = 500, timeoutMs = 8000 } = {}) {
  try {
    await page.waitForNetworkIdle({ idleTime: idleTimeMs, timeout: timeoutMs });
  } catch {
    await new Promise((resolve) => setTimeout(resolve, idleTimeMs));
  }
}

module.exports = {
  matchesMarker,
  detectState,
  waitForState,
  getPageUrl,
  matchesRouteConfig,
  ensureStateChanged,
  waitForPageSettled,
};
