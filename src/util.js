const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const os = require("os");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
// TODO: Find out the best way to use this plugin
// puppeteer.use(RecaptchaPlugin());
const { getPath } = require("./lib/getPath");
const { isEnglishOnly } = require("./lib/language");
const { solveRecaptchaV2 } = require("./lib/captcha");
const { solveNormalCaptcha } = require("./lib/captcha");

const sharp = require("sharp");
const budgie = require("./budgie");
const axios = require("axios");
const nationalities = require("./data/nationalities");
const moment = require("moment");
const _ = require("lodash");
const beautify = require("beautify");
const homedir = require("os").homedir();
const photosFolder = path.join(homedir, "hajonsoft", "photos");
const idFolder = path.join(homedir, "hajonsoft", "id");
const passportsFolder = path.join(homedir, "hajonsoft", "passports");
const residencyFolder = path.join(homedir, "hajonsoft", "residency");
const vaccineFolder = path.join(homedir, "hajonsoft", "vaccine");

const VISION_DEFICIENCY = "none";
const kea = require("./lib/kea");
const { array } = require("yargs");
const { connect } = require("http2");

const MRZ_TD3_LINE_LENGTH = 44;

let page;
let browser;
let lastHandledUrl = "";

function resetLastHandledUrl() {
  lastHandledUrl = "";
}

function shouldDispatchRoute({
  currentUrl,
  handledUrl,
  currentDocumentRevision,
  handledDocumentRevision,
}) {
  return (
    currentUrl !== handledUrl ||
    currentDocumentRevision !== handledDocumentRevision
  );
}

function getChromePath() {
  switch (os.platform()) {
    case "darwin":
      const chromePath =
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      if (fs.existsSync(chromePath)) {
        console.log(os.platform(), chromePath);
        return chromePath;
      }

      throw new Error(`Google Chrome not found at ${chromePath}`);
      break;
    case "linux":
      const linuxChromePath = "/usr/bin/google-chrome-stable";
      if (fs.existsSync(linuxChromePath)) {
        console.log(os.platform(), linuxChromePath);
        return linuxChromePath;
      }

      throw new Error(`Google Chrome not found at ${linuxChromePath}`);
      break;
    default:
      const windows46ChromePath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      if (fs.existsSync(windows46ChromePath)) {
        console.log(os.platform(), windows46ChromePath);
        return windows46ChromePath;
      }
      const userPath = path.join(
        homedir,
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "Application",
        "chrome.exe",
      );
      if (fs.existsSync(userPath)) {
        console.log(os.platform(), userPath);
        return userPath;
      }

      const windows32ChromePath =
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
      if (fs.existsSync(windows32ChromePath)) {
        console.log(os.platform(), windows32ChromePath);
        return windows32ChromePath;
      }
      throw new Error(
        `Google Chrome not found at ${windows32ChromePath} or ${windows46ChromePath}`,
      );
  }
}

function getIssuingCountry(passenger) {
  const issuingCountry = nationalities.nationalities.find(
    (nationality) => nationality.code === passenger.codeline.substring(2, 5),
  );
  return issuingCountry;
}

async function hardenPageFingerprint(currentPage) {
  if (!currentPage) {
    return;
  }

  try {
    const rawUserAgent = await browser.userAgent();
    const normalizedUserAgent = rawUserAgent.replace(
      "HeadlessChrome/",
      "Chrome/",
    );

    await currentPage.setUserAgent(normalizedUserAgent);
    await currentPage.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    const session = await currentPage.target().createCDPSession();
    await session.send("Network.setUserAgentOverride", {
      userAgent: normalizedUserAgent,
      acceptLanguage: "en-US,en;q=0.9",
      platform: "Windows",
    });

    await currentPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });

      Object.defineProperty(navigator, "platform", {
        get: () => "Win32",
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });
  } catch (error) {
    console.log("Fingerprint hardening warning:", error.message);
  }
}

async function initPage(config, onContentLoaded, data) {
  const args = [
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    "--allow-running-insecure-content",
    "--use-fake-ui-for-media-stream",
  ];

  const isCloudRun = Boolean(data?.info?.caravan?.startsWith("CLOUD_"));
  const isNskSystem = data?.system?.name === "nsk";
  if (!isCloudRun) {
    args.push("--incognito");
  }

  args.push(
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--no-default-browser-check",
    "--lang=en-US,en;q=0.9",
  );

  const isWindowed = process.argv.find((c) => c.startsWith("-windowed"));
  if (!process.argv.find((c) => c.startsWith("range=")) && !isWindowed) {
    args.push("--start-fullscreen");
  }

  const isHeadless = Boolean(
    process.argv.find((c) => c.startsWith("--headless")),
  );
  const isVisualHeadless = Boolean(
    global.visualHeadless || process.argv.includes("--visualHeadless"),
  );

  let defaultViewport = null;
  if (process.argv.includes("--auto")) {
    const autoIndexArg = process.argv.find((c) => c.startsWith("--index"));
    if (autoIndexArg) {
      const indexArray = autoIndexArg.split("=")?.[1]?.split("/");
      if (indexArray.length === 2) {
        const monitorWidth = parseInt(
          process.argv
            .find((c) => c.startsWith("--monitor-width"))
            ?.split("=")?.[1],
        );
        const monitorHeight = parseInt(
          process.argv
            .find((c) => c.startsWith("--monitor-height"))
            ?.split("=")?.[1],
        );

        const index = parseInt(indexArray[0]);
        const total = parseInt(indexArray[1]);
        let rows = 1;
        let cols = 1;

        switch (total) {
          case 2:
            rows = 1;
            cols = 2;
            break;
          case 3:
            rows = 2;
            cols = 2;
            break;
          case 4:
            rows = 2;
            cols = 2;
            break;
          case 5:
            rows = 2;
            cols = 3;
            break;
          case 6:
            rows = 2;
            cols = 3;
            break;
          case 7:
            rows = 2;
            cols = 4;
            break;
          case 8:
            rows = 2;
            cols = 4;
            break;
          case 9:
            rows = 3;
            cols = 3;
            break;
          case 10:
            rows = 3;
            cols = 4;
            break;
          case 11:
            rows = 3;
            cols = 4;
            break;
          case 12:
            rows = 3;
            cols = 4;
            break;
          case 13:
            rows = 3;
            cols = 5;
            break;
          case 14:
            rows = 3;
            cols = 5;
            break;
          case 15:
            rows = 3;
            cols = 5;
            break;
          default:
            rows = 1;
            cols = 1;
            break;
        }

        const boxWidth = Math.floor(monitorWidth / cols);
        const boxHeight = Math.floor(monitorHeight / rows);

        const row = Math.floor(index / cols);
        const column = index % cols;

        const xPos = column * boxWidth;
        const yPos = row * boxHeight;

        args.push(
          `--window-size=${boxWidth},${boxHeight}`,
          `--window-position=${xPos},${yPos}`,
        );
        defaultViewport = {
          width: monitorWidth,
          height: monitorHeight,
        };
      }
    }
  }
  if (process.argv.includes("--debug")) {
    global.debug = true;
  }
  const shouldUseHeadless = isVisualHeadless
    ? false
    : !global.debug && (isCloudRun || isHeadless);

  console.log(
    `Browser mode: ${shouldUseHeadless ? "headless" : "visible"}` +
      (isVisualHeadless ? " (--visualHeadless override)" : ""),
  );

  const launchOptions = {
    headless: shouldUseHeadless ? "new" : false,
    ignoreHTTPSErrors: true,
    defaultViewport,
    args,
  };

  if (shouldUseHeadless && !defaultViewport) {
    launchOptions.defaultViewport = {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    };
  }

  if (isNskSystem && !process.argv.includes("--use-bundled-chromium")) {
    try {
      launchOptions.executablePath = getChromePath();
    } catch (error) {
      console.log(
        "Falling back to bundled Chromium because system Chrome was not found:",
        error.message,
      );
    }
  }

  // if (global.debug || (!isCloudRun && !isHeadless)) {
  //   launchOptions.executablePath = getChromePath();
  // }
  const connected = await connectOrOpenDisconnectedChrome();
  if (!connected) {
    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (error) {
      if (shouldUseHeadless) {
        console.log(
          "Headless=new launch failed, retrying with legacy headless:",
          error.message,
        );
        launchOptions.headless = true;
        browser = await puppeteer.launch(launchOptions);
      } else {
        throw error;
      }
    }
  }
  const allPages = await browser.pages();
  console.log("All open pages:", allPages.map((p) => p.url()));
  page = allPages[0];
  console.log(page.url());
  if (!page) {
    console.log("No existing page found, opening a new page.");
    process.exit(1);
  }
  await page.bringToFront();
  await hardenPageFingerprint(page);

  let routeWatcherTimer = null;
  let routeDispatchInFlight = false;
  let routeDispatchPending = false;
  let documentRevision = 0;
  let lastHandledDocumentRevision = -1;

  const dispatchOnContentLoaded = async (reason = "event") => {
    if (routeDispatchInFlight) {
      routeDispatchPending = true;
      return;
    }

    routeDispatchInFlight = true;
    try {
      do {
        routeDispatchPending = false;
        const currentDocumentRevision = documentRevision;
        const currentUrl = await page.url();
        const normalizedUrl = (currentUrl || "").split("#")[0];

        if (!shouldDispatchRoute({
          currentUrl: normalizedUrl,
          handledUrl: lastHandledUrl,
          currentDocumentRevision,
          handledDocumentRevision: lastHandledDocumentRevision,
        })) {
          continue;
        }

        const handled = await onContentLoaded({ reason, url: currentUrl });
        if (handled !== false) {
          lastHandledUrl = normalizedUrl;
          lastHandledDocumentRevision = currentDocumentRevision;
        }
      } while (routeDispatchPending);
    } catch (error) {
      console.error("Route handler failed:", error);
    } finally {
      routeDispatchInFlight = false;
      if (routeDispatchPending) {
        void dispatchOnContentLoaded("queued-navigation");
      }
    }
  };

  page.on("domcontentloaded", () => {
    dispatchOnContentLoaded("domcontentloaded");
  });

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      documentRevision += 1;
      dispatchOnContentLoaded("framenavigated");
    }
  });

  const startRouteWatcher = () => {
    if (routeWatcherTimer) {
      return;
    }

    const tick = async () => {
      await dispatchOnContentLoaded("spa-url-change");
      routeWatcherTimer = setTimeout(tick, 1000);
    };

    tick();
  };

  startRouteWatcher();

  page.on("dialog", async (dialog) => {
    await pauseMessage(page, 5);
    try {
      await dialog.accept();
    } catch {}
  });

  if (process.argv.length > 2) {
    page.on("console", (msg) => {
      // console.log("Eagle: Message=> " + msg.text());
    });
  }
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36."
  // );

  if (!fs.existsSync(path.join(homedir, "hajonsoft"))) {
    fs.mkdirSync(path.join(homedir, "hajonsoft"));
  }

  if (!fs.existsSync(photosFolder)) {
    fs.mkdirSync(photosFolder);
  }
  if (!fs.existsSync(idFolder)) {
    fs.mkdirSync(idFolder);
  }
  if (!fs.existsSync(passportsFolder)) {
    fs.mkdirSync(passportsFolder);
  }
  if (!fs.existsSync(residencyFolder)) {
    fs.mkdirSync(residencyFolder);
  }
  if (!fs.existsSync(vaccineFolder)) {
    fs.mkdirSync(vaccineFolder);
  } else {
    fs.readdir(vaccineFolder, (err, files) => {
      for (const file of files) {
        fs.unlink(path.join(vaccineFolder, file), (err) => {});
      }
    });
  }
  // remove this event to enable right click on the page
  // await page.evaluate(() => {
  //   window.removeEventListener('contextmenu', {});
  // });

  return page;
}

async function connectOrOpenDisconnectedChrome() {
  // Configuration for systems that require remote debugging mode
  const systemConfigs = {
    nsh: { targetUrl: "https://hajj.nusuk.sa" },
    // nsk: { targetUrl: "https://masar.nusuk.sa" },
  };

  const rawData = fs.readFileSync(getPath("data.json"), "utf8");
  const dataJson = JSON.parse(rawData);
  const systemName = dataJson?.system?.name;
  const nshMode = systemConfigs.hasOwnProperty(systemName);
  if (nshMode) {
    const remoteDebuggingPort = process.env.REMOTE_DEBUGGING_PORT || "9222";
    const browserURL = `http://127.0.0.1:${remoteDebuggingPort}`;

    // Calculate defaultViewport for NSH mode connection
    let defaultViewport = null;
    if (process.argv.includes("--auto")) {
      const autoIndexArg = process.argv.find((c) => c.startsWith("--index"));
      if (autoIndexArg) {
        const indexArray = autoIndexArg.split("=")?.[1]?.split("/");
        if (indexArray.length === 2) {
          const monitorWidth = parseInt(
            process.argv
              .find((c) => c.startsWith("--monitor-width"))
              ?.split("=")?.[1],
          );
          const monitorHeight = parseInt(
            process.argv
              .find((c) => c.startsWith("--monitor-height"))
              ?.split("=")?.[1],
          );

          if (monitorWidth && monitorHeight) {
            defaultViewport = {
              width: monitorWidth,
              height: monitorHeight,
            };
          }
        }
      }
    }

    try {
      console.log(
        `NSH Mode: Attempting to connect to browser at ${browserURL}`,
      );
      browser = await puppeteer.connect({
        browserURL,
        defaultViewport,
      });
      console.log(
        "NSH Mode: Successfully connected to existing browser session",
      );
      return true;
    } catch (connectError) {
      console.log(
        `NSH Mode: Failed to connect to existing browser: ${connectError.message}`,
      );
      console.log("NSH Mode: Launching Chrome in remote debugging mode");

      // Launch Chrome in remote debugging mode with platform-specific command
      const { exec } = require("child_process");
      const targetUrl =
        systemConfigs[systemName]?.targetUrl || "https://hajj.nusuk.sa";

      // Platform-specific user data directory
      let userDataDir;
      if (os.platform() === "win32") {
        userDataDir = path.join(os.tmpdir(), "chrome-profile");
      } else {
        userDataDir = "/tmp/chrome-profile";
      }

      let chromeCommand;
      if (os.platform() === "darwin") {
        // macOS command
        chromeCommand = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \
          --remote-debugging-port=${remoteDebuggingPort} \
          --user-data-dir="${userDataDir}" \
          "${targetUrl}"`;
      } else if (os.platform() === "win32") {
        // Windows command
        const chromePath = getChromePath();
        chromeCommand = `"${chromePath}" --remote-debugging-port=${remoteDebuggingPort} \
          --user-data-dir="${userDataDir}" \
          "${targetUrl}"`;
      } else {
        // Linux command
        chromeCommand = `google-chrome --remote-debugging-port=${remoteDebuggingPort} \
          --user-data-dir="${userDataDir}" \
          "${targetUrl}" &`;
      }

      console.log(`NSH Mode: Executing command: ${chromeCommand}`);
      exec(chromeCommand, (error) => {
        if (error) {
          console.error(`NSH Mode: Error launching Chrome: ${error.message}`);
        }
      });

      // Wait for Chrome to start
      console.log("NSH Mode: Waiting for Chrome to start...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("NSH Mode: Chrome launched successfully in debugging mode.");
      console.log(`NSH Mode: Chrome is running on port ${remoteDebuggingPort}`);
      console.log("NSH Mode: You can now work with Chrome normally.");
      console.log("NSH Mode: Run the program again to connect and automate.");
      console.log("NSH Mode: Exiting...");

      // Exit the process to let user work with Chrome
      process.exit(0);
    }
  }
  return false;
}

async function newPage(onNewPageLoaded, onNewPageClosed) {
  const _newPage = await browser.newPage();
  _newPage.on("domcontentloaded", onNewPageLoaded);
  _newPage.on("close", onNewPageClosed);
  return _newPage;
}

async function createControlsFile(
  url,
  container,
  xPath,
  fieldFunction = async () => {},
) {
  const logFolder = getPath("log");
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }
  const fileName =
    logFolder +
    _.last(url.split("/")).replace(/[^a-z0-9]/gim, "") +
    "_" +
    xPath.replace(/[^a-z0-9]/gim, "") +
    ".html";
  const handlers = await container.$x(xPath);

  let i = 0;
  let allText = "";
  for (const handler of handlers) {
    await fieldFunction(handler, i);
    const outerHtml = await handler.evaluate((e) =>
      e.outerHTML.replace(/\t/g, ""),
    );
    allText += `${xPath}-${i}\n`;
    allText += `\t${beautify(outerHtml, { format: "html" })}\n\n`;
    // if select // .replace(/,/g, "\n")}</html>`;
    i++;
  }
  allText +=
    "\n\n\n-------------------BEGIN HTML DUMP-------------------\n\n\n\n\n";
  const html = await container.content();
  console.log(html);
  allText += beautify(html, { format: "html" });
  fs.writeFileSync(fileName, allText);
}

async function storeControls(container, url) {
  createControlsFile(
    url,
    container,
    `//input[@type="text"]`,
    async (handler, index) => {
      await handler.evaluate((e) => {
        e.disabled = false;
        e.readonly = false;
      });
      await handler.type(index.toString());
    },
  );
  createControlsFile(url, container, `//input[@type="file"]`);
  createControlsFile(url, container, `//input[@type="radio"]`);
  createControlsFile(url, container, `//select`);
  createControlsFile(url, container, `//button`);
  createControlsFile(url, container, `//iframe`);
}
let lastTime = new Date();
function timeElapsed() {
  // find time difference in seconds between now and lastTime, then set lasttime to now
  const now = new Date();
  const diff = (now.getTime() - lastTime.getTime()) / 1000;
  lastTime = now;
  return diff.toFixed(0);
}

function findConfig(url, config) {
  let lowerUrl = url?.toLowerCase();
  const urlConfig = config.find(
    (x) =>
      (x.url && x.url.toLowerCase() === lowerUrl) ||
      (x.regex && RegExp(x.regex.toLowerCase()).test(lowerUrl)),
  );
  for (const param of process.argv) {
    if (
      param === "verbose-url=" ||
      param === "verbose-url" ||
      param === "verbose" ||
      param === "-verbose"
    ) {
      setInterval(function () {
        console.log(`Verbose Mode: Navigation: ${url}`);
        storeControls(page, lowerUrl);
      }, 30000);
    }
  }

  if (process.argv.includes(`verbose-url=${url}`)) {
    storeControls(page, lowerUrl);
  }

  if (urlConfig) {
    const elapsedSeconds = timeElapsed();
    statusMessage(page, {
      icon: "✈️",
      section: "WORKFLOW",
      english: `${urlConfig.name} stage ready at ${urlConfig.url || urlConfig.regex} in ${elapsedSeconds}s`,
      arabic: `مرحلة ${urlConfig.name} جاهزة على ${urlConfig.url || urlConfig.regex} خلال ${elapsedSeconds} ثانية`,
      depth: 2,
    });
    return urlConfig;
  }
  return {};
}

function findGorillaConfig(url, gorillaConfigsString) {
  if (!gorillaConfigsString) {
    return;
  }
  const lowerUrl = url?.toLowerCase();
  let gorillaConfigs = "";
  try {
    gorillaConfigs = JSON.parse(gorillaConfigsString);
  } catch (e) {
    console.log(
      "Invalid Gorilla Script, skipping gorilla...",
      gorillaConfigsString,
    );
    return;
  }
  if (!Array.isArray(gorillaConfigs)) {
    return;
  }

  // Find the first matching gorilla configuration
  const matchedGorilla = gorillaConfigs.find((gorilla) => {
    return RegExp(gorilla.regex).test(lowerUrl);
  });
  if (matchedGorilla) {
    infoMessage(
      page,
      `🦍  Gorilla: ${matchedGorilla.description} ${matchedGorilla.regex}`,
      2,
    );
    return matchedGorilla;
  }
}

async function commit(page, details, row) {
  if (!details) return;
  if (details?.[0]?.selector) {
    await page.waitForSelector(details?.[0].selector, {
      timeout: 60000,
    });
  }
  if (details?.[0]?.xPath) {
    await page.$x(details?.[0].xPath);
  }
  for (const detail of details) {
    let value;
    let txt;
    if (detail.value) {
      value = detail.value(row); // call value function and pass current row info
      if (!value && detail.autocomplete) {
        value = budgie.get(detail.autocomplete, detail.defaultValue);
      }
    }
    if (detail.txt) {
      txt = detail.txt(row); // call txt function and pass current row info
    }

    let element;
    if (detail.selector) {
      element = await page.$(detail.selector);
    }
    if (detail.xPath) {
      const xElements = await page.$x(detail.xPath);
      element = xElements[detail.index || 0];
    }
    if (!element || (!value && !txt)) {
      continue;
    }
    let elementType;
    if (detail.selector) {
      elementType = await page.$eval(detail.selector, (e) =>
        e.outerHTML
          .match(/<(.*?) /g)[0]
          .replace(/</g, "")
          .replace(/ /g, "")
          .toLowerCase(),
      );
    }
    if (detail.xPath) {
      const xElements = await page.$x(detail.xPath);
      const xElement = xElements[detail.index];
      elementType = await xElement.evaluate((e) =>
        e.outerHTML
          .match(/<(.*?) /g)[0]
          .replace(/</g, "")
          .replace(/ /g, "")
          .toLowerCase(),
      );
    }
    switch (elementType) {
      case "input":
      case "textarea":
        if (detail.selector) {
          await page.waitForSelector(detail.selector);
          await page.focus(detail.selector);
          await page.type(detail.selector, "");
          await page.evaluate((element) => {
            const field = document.querySelector(element.selector);
            field.removeAttribute("readonly");
            field.removeAttribute("disabled");
            if (field) {
              field.value = "";
              field.setAttribute("value", "");
            }
          }, detail);
        }

        if (value) {
          if (detail.selector) {
            await page.type(detail.selector, (value || "").toString());
            if (detail.setValueDirectly) {
              await page.$eval(
                detail.selector,
                (el, value) => (el.value = (value || "").toString()),
                value,
              );
            }
          }
          if (detail.xPath) {
            const xElements = await page.$x(detail.xPath);
            const xElement = xElements[detail.index];
            await xElement.type(value);
          }
        } else if (detail.autocomplete) {
          if (detail.selector) {
            await page.type(
              detail.selector,
              budgie.get(detail.autocomplete, detail.defaultValue),
            );
          }
          if (detail.xPath) {
            const xElements = await page.$x(detail.xPath);
            const xElement = xElements[detail.index];
            await xElement.type(
              budgie.get(detail.autocomplete, detail.defaultValue),
            );
          }
        }
        break;
      case "select":
        if (value) {
          if (detail.selector) {
            await page.select(detail.selector, value);
          }
          if (detail.xPath) {
            const xElements = await page.$x(detail.xPath);
            const xElement = xElements[detail.index];
            xElement.select(value);
          }
        } else if (txt) {
          if (detail.selector) {
            await selectByValue(detail.selector, txt);
          }
        }
        break;
      default:
        break;
    }
  }
}

async function selectByValue(selector, txt) {
  await page.waitForSelector(selector);
  const options = await page.$eval(selector, (e) => e.innerHTML);
  const valuePattern = new RegExp(`value="(.*)".*?>.*?${txt}</option>`, "im");
  const found = valuePattern.exec(options.replace(/\n/gim, ""));
  if (found && found.length >= 2) {
    await page.select(selector, found[1]);
  }
}

async function selectByValueStrict(selector, txt) {
  try {
    await page.waitForSelector(selector);
    const options = await page.$eval(selector, (e) => e.innerHTML);
    const valuePattern = new RegExp(
      `value="(.{6,7})"( selected="selected")?>${txt}</option>`,
      "im",
    );
    const found = valuePattern.exec(options.replace(/\n/gim, ""));
    if (found && found.length >= 2) {
      await page.select(selector, found[1]);
    }
  } catch (e) {
    console.log("unable to select by value strict", selector);
  }
}

async function selectPrimeDropdownByText(currentPage, selector, optionText) {
  if (!currentPage || !selector || !optionText) {
    return false;
  }

  try {
    await currentPage.waitForSelector(selector, { timeout: 15000 });
    await currentPage.evaluate((dropdownSelector) => {
      const host = document.querySelector(dropdownSelector);
      if (!host) {
        return;
      }

      const clickable =
        host.querySelector(
          ".p-dropdown, .p-select, .p-dropdown-trigger, .p-select-trigger",
        ) || host;
      clickable.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      clickable.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      clickable.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, selector);

    await currentPage.waitForFunction(() => {
      const nodes = document.querySelectorAll(
        ".p-dropdown-item, .p-select-option, li[role='option'], [role='option']",
      );
      return nodes.length > 0;
    }, { timeout: 5000 });

    const clicked = await currentPage.evaluate((dropdownSelector, text) => {
      const normalize = (value) =>
        (value || "")
          .toString()
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

      const target = normalize(text);
      const host = document.querySelector(dropdownSelector);
      const options = Array.from(
        document.querySelectorAll(
          ".p-dropdown-item, .p-select-option, li[role='option'], [role='option']",
        ),
      ).filter((node) => {
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      const exact = options.find(
        (node) => normalize(node.textContent || node.innerText) === target,
      );
      const partial = options.find((node) =>
        normalize(node.textContent || node.innerText).includes(target),
      );
      const choice = exact || partial;

      if (!choice) {
        return false;
      }

      choice.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      choice.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      choice.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      if (!host) {
        return true;
      }

      const hostText = normalize(host.textContent || host.innerText);
      return hostText.includes(target);
    }, selector, optionText);

    return Boolean(clicked);
  } catch {
    return false;
  }
}

async function setInputValue(currentPage, selector, value) {
  if (!currentPage || !selector) {
    return false;
  }

  try {
    await currentPage.waitForSelector(selector, { timeout: 15000 });
    await currentPage.$eval(
      selector,
      (element, nextValue) => {
        if (!element) {
          return;
        }

        element.removeAttribute("readonly");
        element.removeAttribute("disabled");
        element.focus();
        element.value = "";
        element.setAttribute("value", "");
        element.value = (nextValue || "").toString();
        element.setAttribute("value", (nextValue || "").toString());
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.dispatchEvent(new Event("blur", { bubbles: true }));
      },
      value,
    );
    return true;
  } catch {
    return false;
  }
}

function getMofaImportString(passenger) {
  const passportNumber = passenger.passportNumber;
  const mofaNumber = passenger.mofaNumber;
  if (mofaNumber) {
    return " - MOFA: " + mofaNumber;
  }
  try {
    const file = getPath(passportNumber + ".txt");
    if (fs.existsSync(file)) {
      const importContent = fs.readFileSync(file, "utf-8");
      const importJSON = JSON.parse(importContent);
      return " - MOFA: " + importJSON?.status;
    }
  } catch {}
  return "";
}

function getOptionNode(passenger, cursor) {
  return `
  <div style="width: 100%; display: flex; align-items: center; gap: 1rem; background-color: yellow; height: 200px;">
    <div>${cursor + 1}- </div>
    <div>
    ${
      passenger.nationality?.isArabic
        ? passenger?.nameArabic?.given + " " + passenger.nameArabic.last
        : passenger.name.full
    } - ${passenger.passportNumber} - ${passenger?.nationality?.name} - ${
      passenger?.gender || "gender"
    } - ${passenger?.dob?.age || "age"} years old${getMofaImportString(
      passenger,
    )}${
      passenger.email?.includes(".companion") || passenger.isCompanion
        ? "(companion)"
        : ""
    }
    </div>
  </div>
  `;
}

async function controller(page, structure, travellers) {
  if (global.headless) {
    return;
  }
  if (
    !structure.controller ||
    !structure.controller.selector ||
    !structure.controller.action
  ) {
    return;
  }

  travellers = Array.isArray(travellers) ? travellers : [];

  let lastTraveler = getSelectedTraveler();
  // check the last traveler is less than travellers otherwise set last traveler to 0
  if (!travellers.length || lastTraveler >= travellers.length) {
    lastTraveler = 0;
  }

  // TODO: If mofa import is active, then use the SENT status otherwise load all passengers

  let options =
    `<option value='-1'>${isEnglishOnly() ? "Select passenger, then click Send" : "Select passenger, then click Send | حدد الراكب ثم انقر إرسال"}</option>` +
    travellers
      // .filter((t) => !t.email.includes(".companion"))
      .map(
        (traveller, cursor) =>
          `<option value="${cursor}" ${
            cursor == lastTraveler ? "selected" : ""
          }>
          ${getOptionNode(traveller, cursor)}
          </option>`,
      )
      .join(" ");

  try {
    await page.waitForSelector(structure.controller.selector);
    const controllerHandleMethod = `handleEagle${
      structure.controller.name || "Send"
    }Click`;
    const htmlFileName = path.join(__dirname, "assets", "controller.html");
    let html = fs.readFileSync(htmlFileName, "utf8");
    let isLooping = false;
    if (fs.existsSync(getPath("loop.txt"))) {
      isLooping = true;
    }

    await ensureExposedFunction(page, "registerLoop", registerLoop);
    await ensureExposedFunction(
      page,
      controllerHandleMethod,
      structure.controller.action,
    );
    await ensureExposedFunction(page, "unregisterLoop", unregisterLoop);
    await ensureExposedFunction(page, "getVisaCount", getVisaCount);
    await ensureExposedFunction(
      page,
      "handleWTUClick",
      structure.controller.wtuAction || (() => {}),
    );
    await ensureExposedFunction(
      page,
      "handleGMAClick",
      structure.controller.gmaAction || (() => {}),
    );
    await ensureExposedFunction(
      page,
      "handleBAUClick",
      structure.controller.bauAction || (() => {}),
    );
    await ensureExposedFunction(
      page,
      "handleTWFClick",
      structure.controller.twfAction || (() => {}),
    );
    await ensureExposedFunction(
      page,
      "handleLoadImportedOnlyClick",
      handleLoadImportedOnlyClick,
    );
    await ensureExposedFunction(
      page,
      "handleNSKClick",
      structure.controller.nskAction || (() => {}),
    );
    await ensureExposedFunction(page, "closeBrowser", closeBrowser);
    await ensureExposedFunction(page, "handleCloseClick", handleCloseClick);

    // Attach controller
    await page.evaluate(
      (params) => {
        const structureParam = params[0];
        const optionsParam = params[1];
        const controller = structureParam.controller;
        const container = document.querySelector(controller.selector);
        const handleMethodName = params[2];
        const visaPath = structureParam.controller.visaPath || params[3];
        const htmlContent = params[4];
        const pax = params[5];
        const lastTraveler = params[6];
        const isLooping = params[7];
        const sendAllLabel = params[8];
        const paxLabel = `${pax.length}`;
        const renderedHtml = `${htmlContent
          .replace(/{handleMethodName}/, handleMethodName)
          .replace(/{options}/, optionsParam)
          .replace(/{backcolor}/, isLooping ? "#76FF03" : "#8BC34B")
          .replace(/{visaPath}/, visaPath)
          .replace(/{pax}/, paxLabel)
          .replace(/{current}/, (parseInt(lastTraveler) + 1).toString())
          .replace(/{mokhaa}/, controller.mokhaa ? "block" : "none")}`.replace(
          /{sendall}/,
          sendAllLabel,
        );

        if (controller.fixedTopFullWidth) {
          const mountId = controller.mountId || "hajonsoft-eagle-fixed-controller";
          let mount = document.getElementById(mountId);

          if (!mount) {
            mount = document.createElement("div");
            mount.id = mountId;
            mount.style.position = "fixed";
            mount.style.top = "0";
            mount.style.left = "0";
            mount.style.right = "0";
            mount.style.zIndex = "2147483646";
            mount.style.width = "100vw";
            mount.style.boxSizing = "border-box";
            mount.style.pointerEvents = "auto";
            document.body.appendChild(mount);
          }

          mount.innerHTML = renderedHtml;

          const eagleContainer = mount.querySelector("#eagle_container");
          if (eagleContainer) {
            eagleContainer.style.width = "100%";
            eagleContainer.style.margin = "0";
            eagleContainer.style.borderRadius = "0";
            eagleContainer.style.boxSizing = "border-box";
          }

          return;
        }

        if (!container) {
          return;
        }

        container.outerHTML = renderedHtml;
      },
      [
        structure,
        options,
        controllerHandleMethod,
        path.join(homedir, "hajonsoft", "visa"),
        html,
        travellers,
        lastTraveler,
        isLooping,
        isEnglishOnly() ? "Continuous" : "Continuous مستمر",
      ],
    );
  } catch (err) {
    // console.log(err);
  }
}

async function ensureExposedFunction(page, name, action) {
  const bindingState = await page.evaluate((functionName) => {
    return {
      publicFunction: typeof globalThis[functionName] === "function",
      puppeteerBinding:
        typeof globalThis[`puppeteer_${functionName}`] === "function",
    };
  }, name);

  if (bindingState.publicFunction && bindingState.puppeteerBinding) {
    return false;
  }

  try {
    await page.removeExposedFunction(name);
  } catch {}

  await page.evaluate((functionName) => {
    delete globalThis[functionName];
    delete globalThis[`puppeteer_${functionName}`];
  }, name);

  try {
    await page.exposeFunction(name, action);
  } catch (error) {
    if (!/already exists/i.test(error?.message || "")) {
      throw error;
    }

    await page.removeExposedFunction(name);
    await page.exposeFunction(name, action);
  }
  return true;
}

function registerLoop() {
  fs.writeFileSync(getPath("loop.txt"), "", "utf8");
  console.log("Loop registered");
}
function unregisterLoop() {
  if (fs.existsSync(getPath("loop.txt"))) {
    fs.unlink(getPath("loop.txt"), (err) => {});
  }
}
function getVisaCount() {
  const files = fs.readdirSync(path.join(homedir, "hajonsoft", "visa"));
  console.log(
    "%cMyProject%cline:570%cfiles",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(254, 67, 101);padding:3px;border-radius:2px",
    files,
  );
}
async function closeBrowser() {
  await browser.close();
}

async function handleCloseClick() {
  try {
    // Change controller background color to indicate closing
    await page.evaluate(() => {
      const eagleContainer = document.getElementById("eagle_container");
      if (eagleContainer) {
        eagleContainer.style.backgroundColor = "#FF6B6B"; // Red color to indicate closing
      }
    });

    // Wait a moment for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    page.reload();
    process.exit(0);
  } catch (error) {
    console.log("Error refreshing page:", error);
    process.exit(0);
  }
}
async function commander(page, structure, travellers) {
  if (global.headless) {
    return;
  }
  if (
    !structure.controller ||
    !structure.controller.selector ||
    !structure.controller.action
  ) {
    return;
  }

  try {
    await page.waitForSelector(structure.controller.selector, {
      timeout: 0,
    });
    const controllerHandleMethod = `handleEagle${
      structure.controller.name || "Budgie"
    }Click`;
    const isLoop = fs.existsSync(getPath("loop.txt"));

    const htmlFileName = path.join(__dirname, "assets", "commander.html");
    const html = fs.readFileSync(htmlFileName, "utf8");

    await page.evaluate(
      (params) => {
        const structureParam = params[0];
        const controller = structureParam.controller;
        const container = document.querySelector(controller.selector);
        const alertText = controller.alert;
        const handleMethodName = params[1];
        const htmlContent = params[3]
          .replace(/{direction}/, controller.leftAlign ? "direction: rtl;" : "")
          .replace(
            /{structureParam+controller_name}/,
            params[0].controller.name,
          )
          .replace(/{handleMethodName}/, handleMethodName)
          .replace(/{alert}/, alertText || "")
          .replace(
            /{title}/g,
            structureParam.controller.title +
              " " +
              structureParam.controller.arabicTitle,
          );
        container.outerHTML = controller.keepOriginalElement
          ? `<div>${container.outerHTML}${htmlContent}</div>`
          : htmlContent;
      },
      [structure, controllerHandleMethod, isLoop, html],
    );
    const isExposed = await page.evaluate(
      (p) => window[p],
      controllerHandleMethod,
    );
    if (!isExposed) {
      await page.exposeFunction(
        controllerHandleMethod,
        structure.controller.action,
      );
    }

    const isCloseBrowserExposed = await page.evaluate(
      (p) => window[p],
      "closeBrowser",
    );
    if (!isCloseBrowserExposed) {
      await page.exposeFunction("closeBrowser", closeBrowser);
    }
  } catch (err) {
    console.log(err);
  }
}

async function handleLoadImportedOnlyClick() {
  const existingDataRaw = fs.readFileSync(getPath("data.json"), "utf8");
  const existingData = JSON.parse(existingDataRaw);
  const travellersData = [];
  const files = fs.readdirSync(getPath("")).filter((f) => f.endsWith(".txt"));
  const defaultNationalityCode = await page.$eval(
    "#NationalityIsoCode",
    (ele) => ele.value,
  );
  if (!defaultNationalityCode) {
    return;
  }
  const defaultNationalityName = await page.$eval(
    "#NationalityIsoCode",
    (ele) => ele.options[ele.selectedIndex].text,
  );
  for (const file of files) {
    try {
      const data = fs.readFileSync(getPath(file), "utf8");
      if (data.includes("mofaNumber")) {
        const jsonData = JSON.parse(data);
        const nationality = nationalities.nationalities.find(
          (n) => n.name === jsonData.nationality,
        );
        travellersData.push({
          nationality: nationality || {
            name: defaultNationalityName,
            code: defaultNationalityCode,
            telCode: defaultNationalityCode,
          },
          name: { full: jsonData.name || "coming soon" },
          passportNumber: jsonData.passportNumber,
        });
      }
    } catch {}
  }

  const data = {
    system: {
      name: "hsf",
    },
    info: existingData.info,
    travellers: travellersData,
  };

  fs.writeFileSync(getPath("data.json"), JSON.stringify(data));
  await browser.close();
}

function downloadPDF(pdfUrl, pdfName) {
  const pdfPath = path.join(homedir, "hajonsoft", "pdf");
  if (!fs.existsSync(pdfPath)) {
    fs.mkdirSync(pdfPath);
  }
  const pdfFile = path.join(pdfPath, pdfName);
  if (fs.existsSync(pdfFile)) {
    return;
  }
  // download the pdf file
  console.log("Downloading PDF: " + pdfUrl);
}
const getRange = () => {
  const data = JSON.parse(fs.readFileSync(getPath("data.json"), "utf8"));
  const isCloudRun = data.info.caravan.startsWith("CLOUD_");
  if (isCloudRun) {
    // read range from data.json
    const range = data.info?.range?.replace(",", "-");
    return range ? `range=${range}` : "";
  }
  // Not a cloud run
  const cliRange = process.argv.find((arg) => arg.startsWith("range="));
  if (cliRange) {
    return cliRange?.replace(",", "-");
  }
  return "";
};
function scheduleRunCompletionExit() {
  if (global.run?.completionExitScheduled) {
    return;
  }
  global.run.completionExitScheduled = true;

  const data = JSON.parse(fs.readFileSync(getPath("data.json"), "utf8"));
  if (global.headless) {
    console.log(
      isEnglishOnly()
        ? "✅ [COMPLETE] All passengers processed successfully; closing in 2 seconds"
        : "✅ [COMPLETE] All passengers processed successfully; closing in 2 seconds | تمت معالجة جميع المعتمرين بنجاح؛ سيتم الإغلاق خلال ثانيتين",
    );
    setTimeout(() => {
      process.exit(0);
    }, 2000);
    return;
  }

  let timeoutValue = 30000;
  if (data.system.name === "nsk") {
    timeoutValue = 30000;
  }
  console.log(
    isEnglishOnly()
      ? `✅ [COMPLETE] All passengers processed successfully; closing in ${timeoutValue / 1000} seconds`
      : `✅ [COMPLETE] All passengers processed successfully; closing in ${timeoutValue / 1000} seconds | تمت معالجة جميع المعتمرين بنجاح؛ سيتم الإغلاق خلال ${timeoutValue / 1000} ثانية`,
  );
  setTimeout(() => {
    process.exit(0);
  }, timeoutValue);
}

function getSelectedTraveler() {
  const data = JSON.parse(fs.readFileSync(getPath("data.json"), "utf8"));
  let value = global.run.selectedTraveller;
  if (parseInt(value, 10) >= data.travellers.length) {
    scheduleRunCompletionExit();
  }
  return value;
}

function getTravellerCount() {
  try {
    const data = JSON.parse(fs.readFileSync(getPath("data.json"), "utf8"));
    return Array.isArray(data?.travellers) ? data.travellers.length : 0;
  } catch {
    return 0;
  }
}

function clampSelectedTraveller(value, totalTravellers) {
  const numericValue = Number.parseInt(value, 10);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const max = Math.max(0, Number.parseInt(totalTravellers, 10) || 0);
  return Math.min(Math.max(0, safeValue), max);
}

function incrementSelectedTraveler() {
  const selectedTraveler = Number.parseInt(getSelectedTraveler(), 10) || 0;
  const totalTravellers = getTravellerCount();
  const unclampedNext = selectedTraveler + 1;
  const nextTraveler = clampSelectedTraveller(unclampedNext, totalTravellers);

  if (nextTraveler !== unclampedNext) {
    console.log(
      `[COUNTER] Clamp selectedTraveller increment ${unclampedNext} -> ${nextTraveler} (total=${totalTravellers})`,
    );
  }

  console.log(
    `[COUNTER] selectedTraveller before increment=${selectedTraveler}, after increment=${nextTraveler}, total=${totalTravellers}`,
  );

  setSelectedTraveller(nextTraveler);

  if (nextTraveler >= totalTravellers) {
    scheduleRunCompletionExit();
  }

  return nextTraveler;
}

async function setSelectedTraveller(value) {
  // Do not call getSelectedTraveler() here: it has completion side effects
  // (process.exit) that can kill recovery/debug mid-update.
  const totalTravellers = getTravellerCount();
  const clampedValue = clampSelectedTraveller(value, totalTravellers);
  if (clampedValue !== value) {
    console.log(
      `[COUNTER] Clamp selectedTraveller set ${value} -> ${clampedValue} (total=${totalTravellers})`,
    );
  }
  console.log(
    `[COUNTER] selectedTraveller set requested=${value}, applied=${clampedValue}, total=${totalTravellers}`,
  );
  await kea.updateSelectedTraveller(clampedValue);
  return clampedValue;
}

function useCounter(currentCounter) {
  return getSelectedTraveler(currentCounter);
}

function setCounter(currentCounter = 0) {
  incrementSelectedTraveler(currentCounter);
}

async function commitFile(selector, fileName, imgElementSelector) {
  if (!fs.existsSync(fileName) || process.argv.includes("noimage")) {
    return;
  }

  const uploadResponseMatcher = (response) => {
    const url = response.url();
    const method = response.request()?.method?.() || "";
    return method === "POST" && /\/Attachment\/Upload/i.test(url);
  };

  try {
    await page.waitForSelector(selector);
    if (imgElementSelector) {
      await page.waitForSelector(imgElementSelector);
    }
    const input = await page.$(selector);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const uploadResponsePromise = page
        .waitForResponse(uploadResponseMatcher, { timeout: 8000 })
        .catch(() => null);

      await input.uploadFile(fileName);

      const uploadResponse = await uploadResponsePromise;
      const responseBody = uploadResponse
        ? await uploadResponse.text().catch(() => "")
        : "";
      const isRateLimited =
        uploadResponse?.status() === 429 ||
        /too many requests/i.test(responseBody);

      if (!isRateLimited) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return;
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `Attachment upload rate limited after ${maxAttempts} attempts`,
        );
      }

      const cooldownMs = attempt * 5000;
      console.log(
        `Attachment upload rate limited. Retrying in ${cooldownMs}ms (attempt ${attempt + 1}/${maxAttempts}).`,
      );
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
    }
  } catch (err) {
    console.log(err);
  }
}

async function captchaClick(selector, numbers, actionSelector) {
  await page.waitForSelector(selector);
  await page.focus(selector);
  await page.waitForFunction(
    (args) => {
      document.querySelector(args[0]).value.length === args[1];
    },
    { timeout: 0 },
    [selector, numbers],
  );
  await page.click(actionSelector);
}

async function downloadImage(url, imagePath) {
  // console.log("Deprecated, please use downloadAndResizeImage");
  if (!url) return;
  const writer = fs.createWriteStream(imagePath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
// TODO: review https://imageresizer.com/ for a better resize information including size on desk
async function downloadAndResizeImage(
  passenger,
  width,
  height,
  imageType = "photo",
  minKb,
  maxKb,
  convertToPNG = false,
) {
  const minSizeKb = Number(minKb);
  const maxSizeKb = Number(maxKb);

  if (width && height) {
    if (!Number.isFinite(minSizeKb) || !Number.isFinite(maxSizeKb)) {
      throw new Error(
        `downloadAndResizeImage requires numeric minKb and maxKb for ${imageType}`,
      );
    }
  }

  let folder = photosFolder;
  let url = passenger?.images?.photo;
  if (!url && imageType == "photo") {
    return path.join(__dirname, "./dummy-image.jpg");
  }

  if (!passenger.images) {
    return path.join(__dirname, "./dummy-image.jpg");
  }

  if (imageType == "passport") {
    folder = passportsFolder;
    url = passenger.images.passport;
  }

  if (imageType == "residency") {
    folder = residencyFolder;
    url = passenger.images.residency ?? passenger.images.passport;
  }

  if (imageType == "vaccine") {
    folder = vaccineFolder;
    url = passenger.images.vaccine ?? passenger.images.covid1;
    if (url?.includes("placeholder")) {
      return path.join(__dirname, "covid-1.jpg");
    }
  }

  if (imageType == "vaccine2") {
    folder = vaccineFolder;
    url = passenger.images.vaccine2 ?? passenger.images.covid2;
    if (url?.includes("placeholder")) {
      return path.join(__dirname, "covid-2.jpg");
    }
  }

  if (imageType == "id") {
    folder = idFolder;
    url = passenger.images.id;
    if (!url || url?.includes("placeholder")) {
      return path.join(__dirname, "id.jpg");
    }
  }

  let imagePath = path.join(folder, `${passenger.passportNumber}.jpg`);
  const resizedPath = path.join(
    folder,
    `${passenger.passportNumber}_${width ?? ""}x${height ?? ""}.${
      convertToPNG ? "png" : "jpg"
    }`,
  );

  if (url?.includes("placeholder")) {
    return path.join(__dirname, "dummy-image.jpg");
  }

  const writer = fs.createWriteStream(imagePath);
  if (!url) {
    return path.join(__dirname, "dummy-image.jpg");
  }
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);
  const result = new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  await result;

  const overridePhoto = path.join(
    __dirname,
    "..",
    "photos",
    passenger.passportNumber + ".jpg",
  );
  if (imageType == "photo" && fs.existsSync(overridePhoto)) {
    console.log("override found at: ", overridePhoto);
    imagePath = overridePhoto;
  }
  if (width && height) {
    let quality = 80;
    await sharp(imagePath)
      .resize(width, height, {
        fit: sharp.fit.contain,
      })
      .withMetadata()
      .toFormat(convertToPNG ? "png" : "jpeg", {
        quality,
        chromaSubsampling: "4:4:4",
      })
      .toFile(resizedPath);

    let sizeAfter = Math.round(fs.statSync(resizedPath).size / 1024);

    while (sizeAfter < minSizeKb && quality <= 95) {
      quality += 5;
      await sharp(imagePath)
        .resize(width, height, {
          fit: sharp.fit.contain,
        })
        .withMetadata()
        .toFormat(convertToPNG ? "png" : "jpeg", {
          quality,
          chromaSubsampling: "4:4:4",
        })
        .toFile(resizedPath);
      sizeAfter = Math.round(fs.statSync(resizedPath).size / 1024);
    }

    while (sizeAfter > maxSizeKb && quality > 10) {
      quality -= 5;
      await sharp(imagePath)
        .resize(width, height, {
          fit: sharp.fit.contain,
        })
        .withMetadata()
        .toFormat(convertToPNG ? "png" : "jpeg", {
          quality,
          chromaSubsampling: "4:4:4",
        })
        .toFile(resizedPath);
      sizeAfter = Math.round(fs.statSync(resizedPath).size / 1024);
    }
  } else {
    resizedPath = imagePath;
  }
  return resizedPath;
}

const loopMonitor = [];

function isCodelineLooping(traveller, numberOfEntries = 1) {
  if (!traveller) {
    return true;
  }

  loopMonitor.push({
    key: traveller.codeline,
    data: traveller,
  });
  if (
    loopMonitor.filter((x) => x.key === traveller.codeline).length >
    numberOfEntries
  ) {
    return true;
  }
  return false;
}

function endCase(name) {
  const regEx = new RegExp(`${name}[_-]only`);
  if (process.argv.some((arg) => regEx.test(arg))) {
    browser.disconnect();
  }
}

async function sniff(page, details) {
  //TODO: Add xPath processing for all page operations below so we can sniff based on xPath
  // TODO: Sniff tawaf birth place and other important fields
  for (const detail of details) {
    if (detail.autocomplete) {
      let tagName = await page.$eval(detail.selector, (el) => el.tagName);
      switch (tagName.toLowerCase()) {
        case "input":
          let inputText = await page.$eval(
            detail.selector,
            (el) => el.value || el.innerText,
          );
          if (detail.autocomplete && inputText) {
            budgie.save(detail.autocomplete, inputText);
          }
          break;
        case "select":
          let selectedValue = await page.$eval(
            detail.selector,
            (el) => el.value,
            tagName,
          );
          if (detail.autocomplete && selectedValue) {
            budgie.save(detail.autocomplete, selectedValue);
          }
          break;
      }
    }
  }
}

let mofaData = {};

function getMofaData() {
  return mofaData;
}
async function handleMofa(currentPage, id1, id2, mofa_visaTypeValue) {
  const url = await currentPage.url();
  if (!url) {
    return;
  }
  switch (url.toLowerCase()) {
    case "https://visa.mofa.gov.sa/".toLowerCase():
    case "https://visa.mofa.gov.sa".toLowerCase():
      mofaData = {};
      const closeButtonSelector =
        "#dlgMessageContent > div.modal-footer > button";
      await currentPage.waitForSelector(closeButtonSelector);
      await currentPage.$eval(closeButtonSelector, (btn) => {
        btn.click();
      });

      if (mofa_visaTypeValue && /^[0-9]{1,5}$/.test(mofa_visaTypeValue)) {
        await currentPage.select("#SearchingType", mofa_visaTypeValue);
      }
      await currentPage.waitForSelector("#ApplicationNumber");
      await currentPage.type("#ApplicationNumber", id1);
      await currentPage.type("#SponserID", id2);

      await waitForPageCaptcha(currentPage, "#Captcha", 6);
      await sniff(currentPage, [
        { selector: "#SearchingType", autocomplete: "mofa_visaType" },
        { selector: "#ApplicationNumber", autocomplete: "mofa_id1" },
        { selector: "#SponserID", autocomplete: "mofa_id2" },
      ]);
      await currentPage.click("#btnSearch");
      break;
    case "https://visa.mofa.gov.sa/Home/PrintVisa".toLowerCase():
      const applicationTypeSelector =
        "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(1) > div:nth-child(2) > h2";
      const applicationType = await readValue(
        currentPage,
        applicationTypeSelector,
      );
      if (applicationType == "خطاب الدعوة") {
        mofaData.applicationType = "invitation";

        const inv_id1Selector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(4) > div:nth-child(2) > label";
        const id2Selector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(5) > div:nth-child(4) > label";

        const sponsorNameSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(5) > div:nth-child(2) > label";
        const addressSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(7) > div > label";
        const visaTypeSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(1)";
        const embassySelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(5)";
        const nameSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(4)";
        const professionSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(8)";
        const id1Selector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(4) > div:nth-child(2) > label";
        const telSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(6) > div > label";
        const numberOfEntriesSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(9)";
        const durationSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(10)";

        // #content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(4) > div:nth-child(2) > label
        mofaData = {
          ...mofaData,
          name: await readValue(currentPage, nameSelector),
          sponsorName: await readValue(currentPage, sponsorNameSelector),
          tel: await readValue(currentPage, telSelector),
          address: await readValue(currentPage, addressSelector),
          numberOfEntries: await readValue(
            currentPage,
            numberOfEntriesSelector,
          ),
          embassy: await readValue(currentPage, embassySelector),
          duration: await readValue(currentPage, durationSelector),
          visaType: await readValue(currentPage, visaTypeSelector),
          id1: await readValue(currentPage, id1Selector),
          id2: await readValue(currentPage, id2Selector),
          profession: await readValue(currentPage, professionSelector),
        };
      } else if (applicationType == "مستند تأشيرة") {
        mofaData.applicationType = "visa";
        const sponsorNameSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(5) > div:nth-child(2) > label";
        const addressSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(7) > div > label";
        const visaTypeSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(1)";
        const embassySelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(5)";
        const nameSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(4)";
        const id2Selector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(5) > div:nth-child(4) > label";
        const professionSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(8)";
        const id1Selector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(4) > div:nth-child(2) > label";
        const telSelector =
          "#content > div > div.row > div > div > div.portlet-body.form > div.form-body.form-display.form-horizontal.page-print > div:nth-child(6) > div > label";
        const numberOfEntriesSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(9)";
        const durationSelector =
          "#tblDocumentVisaList > tbody > tr > td:nth-child(10)";

        mofaData = {
          ...mofaData,
          name: await readValue(currentPage, nameSelector),
          sponsorName: await readValue(currentPage, sponsorNameSelector),
          tel: await readValue(currentPage, telSelector),
          address: await readValue(currentPage, addressSelector),
          numberOfEntries: await readValue(
            currentPage,
            numberOfEntriesSelector,
          ),
          embassy: await readValue(currentPage, embassySelector),
          duration: await readValue(currentPage, durationSelector),
          visaType: await readValue(currentPage, visaTypeSelector),
          id1: await readValue(currentPage, id1Selector),
          id2: await readValue(currentPage, id2Selector),
          profession: await readValue(currentPage, professionSelector),
        };
      }

      break;
  }
}

async function readValue(currentPage, selector) {
  await currentPage.waitForSelector(selector);
  const value = await currentPage.$eval(selector, (ele) => ele.innerText);
  return value;
}

async function waitForCaptcha(selector, captchaLength, timeout = 0) {
  const captchaElement = await page.$(selector);
  if (!captchaElement) {
    return;
  }
  try {
    await page.waitForSelector(selector);
    await page.evaluate((cap) => {
      const captchaElement = document.querySelector(cap);
      captchaElement.scrollIntoView({ block: "end" });
      captchaElement.value = "";
    }, selector);
    await page.focus(selector);
    await page.hover(selector);
    await page.waitForFunction(
      `document.querySelector('${selector}').value.length === ${captchaLength}`,
      { timeout },
    );
  } catch (err) {
    console.log(err);
  }
}

async function waitForPageCaptcha(
  captchaPage,
  selector,
  captchaLength,
  timeout = 0,
) {
  await captchaPage.waitForSelector(selector);
  await captchaPage.bringToFront();
  await captchaPage.evaluate((cap) => {
    const captchaElement = document.querySelector(cap);
    captchaElement.scrollIntoView({ block: "end" });
    captchaElement.value = "";
  }, selector);
  await captchaPage.focus(selector);
  await captchaPage.hover(selector);
  await captchaPage.waitForFunction(
    `document.querySelector('${selector}').value.length === ${captchaLength}`,
    { timeout },
  );
}

const { showCaptchaSnackbar } = require("./targets/common/overlay-ui");

async function commitCaptchaToken(
  page,
  imgId,
  textFieldSelector,
  captchaLength = 6,
  captchaOptions = {},
) {
  const imageSelector = imgId.startsWith("#") ? imgId : `#${imgId}`;
  return commitNormalCaptchaWithSelector(page, imageSelector, textFieldSelector, {
    ...captchaOptions,
    numeric: captchaOptions.numeric ?? 1,
    minLength: captchaOptions.minLength ?? captchaLength,
    maxLength: captchaOptions.maxLength ?? captchaLength,
  });
}

async function commitCaptchaTokenWithSelector(
  page,
  imageSelector,
  textFieldSelector,
  captchaLength = 6,
  captchaOptions = {},
) {
  return commitNormalCaptchaWithSelector(page, imageSelector, textFieldSelector, {
    ...captchaOptions,
    numeric: captchaOptions.numeric ?? 1,
    minLength: captchaOptions.minLength ?? captchaLength,
    maxLength: captchaOptions.maxLength ?? captchaLength,
  });
}

async function commitNormalCaptchaWithSelector(
  page,
  imageSelector,
  textFieldSelector,
  captchaOptions = {},
) {
  infoMessage(page, "🔓 Captcha thinking...", 5);
  await pauseMessage(page, 3);
  await showCaptchaSnackbar(page, "Submitting task to 2Captcha...", "info");

  if (!global.captchaKey) {
    console.log("2Captcha key not found in global.captchaKey");
    return null;
  }

  await page.waitForSelector(imageSelector);
  await page.waitForSelector(textFieldSelector);

  const imageHandle = await page.$(imageSelector);
  if (!imageHandle) {
    return null;
  }

  await page.$eval(imageSelector, (image) => {
    image.scrollIntoView({ block: "center", inline: "center" });
  });
  await page.waitForFunction(
    (selector) => {
      const image = document.querySelector(selector);
      return image?.complete && image.naturalWidth > 0;
    },
    { timeout: 5000 },
    imageSelector,
  );

  const base64 = await imageHandle.screenshot({ encoding: "base64" });
  if (!base64) {
    return null;
  }

  try {
    const maxCaptchaAttempts =
      Number.isFinite(Number(captchaOptions?.maxAttempts)) &&
      Number(captchaOptions.maxAttempts) > 0
        ? Number(captchaOptions.maxAttempts)
        : 32;

    const token = await solveNormalCaptcha({
      apiKey: global.captchaKey,
      body: base64,
      numeric: captchaOptions.numeric ?? 1,
      phrase: Boolean(captchaOptions.phrase),
      caseSensitive: Boolean(captchaOptions.caseSensitive),
      math: Boolean(captchaOptions.math),
      minLength: Number(captchaOptions.minLength ?? captchaOptions.captchaLength ?? 0),
      maxLength: Number(captchaOptions.maxLength ?? captchaOptions.captchaLength ?? 0),
      comment: captchaOptions.comment,
      imgInstructions: captchaOptions.imgInstructions,
      languagePool: captchaOptions.languagePool,
      maxAttempts: maxCaptchaAttempts,
      pollIntervalMs: captchaOptions.pollIntervalMs,
      signal: captchaOptions.signal,
      onPoll: async (attempt, taskId) => {
        await showCaptchaSnackbar(
          page,
          `Waiting for solve (${attempt}/${maxCaptchaAttempts}), task ${taskId}`,
          "info",
        );

        if (typeof captchaOptions.onPoll === "function") {
          await captchaOptions.onPoll(attempt, taskId);
        }
      },
    });

    if (!token) {
      return null;
    }

    await commit(page, [{ selector: textFieldSelector, value: () => token.toString() }], {});
    await showCaptchaSnackbar(page, "Token injected, checking next step", "success");
    infoMessage(page, "🔓 Captcha solved! " + token, 5);
    return token;
  } catch (err) {
    await showCaptchaSnackbar(
      page,
      `Solve failed: ${err?.message || "unknown error"}`,
      "error",
    );
    infoMessage(page, "🔓 Captcha error!", 5);
    console.log(err);
    return null;
  }
}

async function SolveIamNotARobot(
  responseSelector,
  url,
  siteKey,
  signal,
  captchaOptions = {},
) {
  if (!global.captchaKey) {
    await statusMessage(page, {
      icon: "⚠️",
      section: "SECURITY",
      english: "Secure verification is awaiting service configuration",
      arabic: "التحقق الآمن بانتظار إعداد خدمة التحقق",
      depth: 1,
    });
    return null;
  }

  if (!siteKey) {
    await statusMessage(page, {
      icon: "⚠️",
      section: "SECURITY",
      english: "Secure verification is awaiting page configuration",
      arabic: "التحقق الآمن بانتظار إعداد صفحة الخدمة",
      depth: 1,
    });
    return null;
  }

  const showSnackbar = captchaOptions?.suppressSnackbar !== true;
  const exitOnTimeout = captchaOptions?.exitOnTimeout !== false;

  try {
    const targetUrl = url || (await page.url());
    if (showSnackbar) {
      await showCaptchaSnackbar(
        page,
        isEnglishOnly()
          ? "Secure verification started"
          : "Secure verification started | بدأ التحقق الآمن",
        "info",
      );
    }

    const maxCaptchaAttempts =
      Number.isFinite(Number(captchaOptions?.maxAttempts)) &&
      Number(captchaOptions?.maxAttempts) > 0
        ? Number(captchaOptions.maxAttempts)
        : 32;

    const tokenValue = await solveRecaptchaV2({
      apiKey: global.captchaKey,
      websiteURL: targetUrl,
      websiteKey: siteKey,
      isEnterprise: Boolean(captchaOptions?.isEnterprise),
      recaptchaDataSValue: captchaOptions?.recaptchaDataSValue,
      userAgent: captchaOptions?.userAgent,
      maxAttempts: maxCaptchaAttempts,
      signal,
      onPoll: async (attempt, taskId) => {
        await statusMessage(page, {
          icon: "🛡️",
          section: "SECURITY",
          english: `Secure verification in progress (attempt ${attempt}/${maxCaptchaAttempts}, task ${taskId})`,
          arabic: `جارٍ إتمام التحقق الآمن (المحاولة ${attempt}/${maxCaptchaAttempts}، المهمة ${taskId})`,
          depth: 1,
        });
        if (showSnackbar) {
          await showCaptchaSnackbar(
            page,
            `Secure verification in progress (${attempt}/${maxCaptchaAttempts}) | جارٍ إتمام التحقق الآمن (${attempt}/${maxCaptchaAttempts})`,
            "info",
          );
        }

        if (typeof captchaOptions.onPoll === "function") {
          await captchaOptions.onPoll(attempt, taskId);
        }
      },
    });

    const injectionResult = await page.evaluate((selector, token, expectedSiteKey) => {
      const touched = new Set();
      const nodes = [];

      const directNode = document.querySelector(selector);
      if (directNode) {
        nodes.push(directNode);
      }

      document
        .querySelectorAll('textarea#g-recaptcha-response, textarea[name="g-recaptcha-response"], input[name="g-recaptcha-response"]')
        .forEach((node) => nodes.push(node));

      if (!nodes.length && selector.startsWith("#")) {
        const id = selector.slice(1);
        const created = document.createElement("textarea");
        created.id = id;
        created.name = "g-recaptcha-response";
        created.style.display = "none";
        document.body.appendChild(created);
        nodes.push(created);
      }

      nodes.forEach((el) => {
        if (!el || touched.has(el)) {
          return;
        }
        touched.add(el);
        if (!el.style.display) {
          el.style.display = "none";
        }
        el.value = token;
        el.innerHTML = token;
        el.setAttribute("value", token);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });

      let callbacksInvoked = 0;
      const seen = new Set();
      const callbacks = new Set();

      const scanForCallbacks = (obj, hasSiteKeyMatch = false, depth = 0) => {
        if (!obj || typeof obj !== "object") {
          return;
        }
        if (seen.has(obj)) {
          return;
        }
        if (depth > 10) {
          return;
        }
        seen.add(obj);

        const localSiteKey =
          obj.sitekey || obj.siteKey || obj.k || obj.websiteKey || null;
        const matched =
          hasSiteKeyMatch ||
          (expectedSiteKey && localSiteKey === expectedSiteKey);

        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          if (!value) {
            return;
          }

          if (typeof value === "function" && key.toLowerCase() === "callback") {
            if (matched || !expectedSiteKey) {
              callbacks.add(value);
            }
            return;
          }

          if (typeof value === "object") {
            scanForCallbacks(value, matched, depth + 1);
          }
        });
      };

      document.querySelectorAll("[data-callback]").forEach((el) => {
        const name = (el.getAttribute("data-callback") || "").trim();
        if (!name) {
          return;
        }
        const fn = window[name];
        if (typeof fn === "function") {
          callbacks.add(fn);
        }
      });

      try {
        if (window.___grecaptcha_cfg?.clients) {
          scanForCallbacks(window.___grecaptcha_cfg.clients);
        }
      } catch {}

      callbacks.forEach((fn) => {
        try {
          fn(token);
          callbacksInvoked += 1;
        } catch {}
      });

      return {
        injectedCount: touched.size,
        callbacksInvoked,
      };
    }, responseSelector, tokenValue, siteKey);

    if (!injectionResult?.injectedCount) {
      throw new Error(`Unable to inject captcha token into ${responseSelector}`);
    }

    await statusMessage(page, {
      icon: "🔗",
      section: "SECURITY",
      english: `Verification connected successfully (${injectionResult.injectedCount} response field, ${injectionResult.callbacksInvoked} confirmation callback)`,
      arabic: `تم ربط التحقق بنجاح (${injectionResult.injectedCount} حقل استجابة، ${injectionResult.callbacksInvoked} استدعاء تأكيد)`,
      depth: 1,
    });

    if (showSnackbar) {
      await showCaptchaSnackbar(
        page,
        "Verification connected; confirming the next step | تم ربط التحقق؛ جارٍ تأكيد الخطوة التالية",
        "success",
      );
    }
    await statusMessage(page, {
      icon: "✅",
      section: "SECURITY",
      english: "Human verification completed successfully",
      arabic: "اكتمل التحقق البشري بنجاح",
      depth: 1,
    });
    return tokenValue;
  } catch (error) {
    const errorMessage = error?.message || "unknown error";
    if (showSnackbar) {
      await showCaptchaSnackbar(
        page,
        `Verification needs attention: ${errorMessage} | التحقق بحاجة إلى مراجعة`,
        "error",
      );
    }
    await statusMessage(page, {
      icon: "⚠️",
      section: "SECURITY",
      english: `Verification needs attention: ${errorMessage}`,
      arabic: "تعذر إكمال التحقق الآمن تلقائيًا؛ العملية بحاجة إلى مراجعة",
      depth: 1,
    });

    if (/2Captcha timed out waiting for captcha result/i.test(errorMessage)) {
      if (!exitOnTimeout) {
        await statusMessage(page, {
          icon: "⏳",
          section: "SECURITY",
          english: "Automatic verification window ended; the workflow remains available",
          arabic: "انتهت مهلة التحقق التلقائي؛ لا يزال مسار العمل متاحًا",
          depth: 1,
        });
        return null;
      }

      const timeoutMatch = errorMessage.match(
        /after\s+(\d+)\s+attempts\s+in\s+(\d+)ms/i,
      );
      const attempts = timeoutMatch?.[1] || "unknown";
      const elapsedMs = timeoutMatch?.[2] || "unknown";
      const elapsedSeconds =
        elapsedMs === "unknown"
          ? "unknown"
          : (Number(elapsedMs) / 1000).toFixed(1);
      const exitMessage =
        `⚠️ [SECURITY] Automatic verification window ended after ${attempts} attempts in ${elapsedSeconds}s; closing safely | انتهت مهلة التحقق التلقائي بعد ${attempts} محاولة خلال ${elapsedSeconds} ثانية؛ جارٍ الإغلاق بأمان`;
      await infoMessage(page, exitMessage, 2);
      console.log(exitMessage);
      process.exit(1);
    }

    return null;
  }
}
const premiumSupportAlert = async (page, selector, data) => {
  await page.waitForSelector(selector);
  const adNode = await page.$(selector);
  if (!adNode) {
    return;
  }
  const htmlFileName = path.join(__dirname, "assets", "premium-support.html");
  const html = fs.readFileSync(htmlFileName, "utf8");
  await page.$eval(
    selector,
    (el, params) => {
      const json = params[0];
      const html = params[1];
      let htmlContent = html;
      htmlContent = html
        .replace(/{price}/g, json.travellers.length * 1.5)
        .replace(/{pax}/g, json.travellers.length);

      el.outerHTML = htmlContent;
    },
    [data, html],
  );
};

function getOverridePath(original, override) {
  if (fs.existsSync(override)) {
    console.log("override found: using ", override);
    return override;
  }

  return original;
}
async function uploadImage(fileName) {
  const image = await sharp(fileName);
  const metadata = await image.metadata();
  if (metadata.width < 10) {
    return;
  }
}

const infoMessage = async (
  page,
  message,
  depth = 2,
  visaShot = false,
  takeScreenShot = false,
) => {
  const passengerNumber = parseInt(getSelectedTraveler()) + 1;
  const indent = "  ".repeat(Math.max(0, depth - 1));
  console.log(`🦅 [PAX ${passengerNumber}] ${indent}${message}`);
  const screenshotsDir = getPath("screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  const screenshotFileName = path.join(
    screenshotsDir,
    `${moment().format("YYYY-MM-DD-HH-mm-ss")}.png`,
  );
  const isCloudRun = Boolean(global.headless);
  if (page) {
    try {
      await page.evaluate("document.title='" + message + "'");
      // Capture screenshot and display image in log
      if (isCloudRun && takeScreenShot) {
        await page.screenshot({ path: screenshotFileName, fullPage: true });
        await uploadImage(screenshotFileName);
        if (visaShot) {
          await uploadImage(visaShot);
        }
      }
    } catch (e) {
      // console.log("Error while taking screenshot: ", e);
    }
  }
};

const statusMessage = async (
  page,
  {
    icon = "ℹ️",
    section = "EAGLE",
    english,
    arabic,
    depth = 2,
  },
) => {
  const labels = [english, isEnglishOnly() ? null : arabic]
    .filter(Boolean)
    .join(" | ");
  const message = `${icon} [${section.toUpperCase()}] ${labels}`;
  await infoMessage(page, message, depth);
};

const pauseMessage = async (page, seconds = 3) => {
  const isUnattended = Boolean(global.headless || global.visualHeadless);
  if (isUnattended) {
    // no one is watching the title, just hold for the requested duration
    if (seconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
    return;
  }

  try {
    if (page) {
      if (seconds <= 0) {
        await page.evaluate("document.title=''");
      } else {
        await page.evaluate(
          "document.title='Eagle: pause for " + seconds + " seconds'",
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await pauseMessage(page, seconds - 1);
      }
    }
  } catch (err) {
    // Uncomment to debug
    // console.log("Error while pausing: ", err);
  }
};

const pauseForInteraction = async (page, seconds) => {
  await pauseMessage(page, seconds);
};

function getLogFile(eagleData) {
  if (!eagleData) {
    const rawData = fs.readFileSync(getPath("data.json"), "utf-8");
    eagleData = JSON.parse(rawData);
  }
  const logFolder = path.join(getPath("log"), eagleData.info.munazim);
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder, { recursive: true });
  }
  const logFile = path.join(
    logFolder,
    eagleData.info.caravan + "_" + eagleData.system.name + ".txt",
  );
  return logFile;
}

const suggestGroupName = (data) => {
  if (global.submission) {
    return `${new Date().getTime()}_${global.submission.name}`.substring(0, 50);
  }

  const time = moment().format("mmss");

  const suggestedName = `${data.travellers?.[0]?.name?.first.substring(
    0,
    10,
  )}_${data.travellers?.[0]?.name?.last.substring(0, 10)}$_${os
    .hostname()
    .substring(0, 8)}${time}_${data.info.run}`;

  return (
    suggestedName.replace(/[^a-zA-Z0-9_]/g, "") +
    Math.random().toString(36).substring(2, 5)
  );
};

async function screenShotAndContinue(page, visaElement, visaFileName, url) {
  await visaElement.screenshot({
    path: visaFileName,
    type: "png",
  });
  await page.goto(url);
}

async function toggleBlur(page, blur = true) {
  if (global.headless) {
    return;
  }
  if (blur) {
    await page.emulateVisionDeficiency("blurredVision");
  } else {
    await page.emulateVisionDeficiency("none");
  }
}

function isTravelDocument(passenger) {
  // if nationality code is XXA, XXB, XXC or XXX then it is a travel document
  if (["XXX", "XXA", "XXB", "XXC"].includes(passenger.nationality.code)) {
    return true;
  }

  // if the issuing country is not the same as nationality then it is a travel document
  if (passenger.codeline.substring(2, 5) !== passenger.nationality.code) {
    return true;
  }
  return false;
}

async function screenShotToKea(
  visaElement,
  accountId,
  currentPassenger,
  status = "Submitted",
) {
  // SPA pages (especially Nusuk) keep mutating the DOM, so stability observers
  // almost always time out. A short fixed wait is enough before capture.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // save base64 image to firestore
  const base64 = await visaElement.screenshot({
    encoding: "base64",
    type: "jpeg",
    quality: 70,
  });

  const filename = `visa_${currentPassenger.passportNumber}.jpeg`;
  const destination = `${accountId}/visaImageUrl/${filename}`;
  const visaImageUrl = await kea.uploadImageToStorage(base64, destination);

  const systemName =
    JSON.parse(fs.readFileSync(getPath("data.json"), "utf8"))?.system?.name ||
    "hsf";

  // Send base64 encoded string to kea
  await kea.updatePassenger(accountId, currentPassenger.passportNumber, {
    visaImageUrl,
    [`submissionData.${systemName}.status`]: status,
  });
}

function getDownloadFolder() {
  if (fs.existsSync(getPath(".downloadFolder"))) {
    return fs.readFileSync(getPath(".downloadFolder"), "utf-8");
  }
  return path.join(homedir, "Downloads");
}

async function pdfToKea(
  pdfBuffer,
  accountId,
  passengerFromPage,
  status = "visa",
) {
  const folder = path.join(getDownloadFolder(), "hajonsoft", "pdf");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  const pdfFileName = path.join(
    folder,
    `visa_${passengerFromPage.passportNumber}.pdf`,
  );
  fs.writeFileSync(pdfFileName, pdfBuffer);
  const base64 = await pdfBuffer.toString("base64");
  const pdfFilename = `visa_${passengerFromPage.passportNumber}.pdf`;
  const pdfDestination = `${accountId}/visaImageUrl/${pdfFilename}`;
  const pdfUrl = await kea.uploadImageToStorage(base64, pdfDestination);
  await kea.updatePassenger(accountId, passengerFromPage.passportNumber, {
    visaImageUrl: pdfUrl,
    "submissionData.nsk.status": status,
  });
  return { pdfUrl, pdfFileName };
}

async function remember(page, selector) {
  const val = await page.$eval(selector, (el) => el.value);
  budgie.save(selector, val);
}

async function recall(page, selector) {
  const val = budgie.get(selector);
  if (val) {
    await commit(page, [{ selector, value: () => val }]);
  }
}

async function getCurrentTime() {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip");
    const { unixtime } = response.data;
    return new Date(unixtime * 1000);
  } catch (error) {
    console.error(error);
    return null;
  }
}

const hijriYear = 44;

async function clickWhenReady(selector, page) {
  try {
    await page.waitForSelector(selector);
    for (let i = 0; i < 10; i++) {
      try {
        await page.click(selector);
        return;
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function generateMRZ(passenger) {
  console.log(passenger);
  try {
    // LINE 1
    const codeLine1 = `P<${
      passenger.nationality.code
    }${passenger.name.last.replace(/ /g, "<")}<<${passenger.name.given.replace(
      / /g,
      "<",
    )}`
      .padEnd(MRZ_TD3_LINE_LENGTH, "<")
      .substring(0, MRZ_TD3_LINE_LENGTH);
    // LINE 2
    const icaoPassportNumber = passenger.passportNumber.padEnd(9, "<");
    const birthDate = `${passenger.dob.yyyy.substring(2)}${passenger.dob.mm}${
      passenger.dob.dd
    }`;
    const expiryDate = `${passenger.passExpireDt.yyyy.substring(2)}${
      passenger.passExpireDt.mm
    }${passenger.passExpireDt.dd}`;
    const gender = passenger.gender.substring(0, 1).toUpperCase();
    let codeLine2 = `${icaoPassportNumber}${checkDigit(icaoPassportNumber)}${
      passenger.nationality.code
    }${birthDate}${checkDigit(birthDate)}${gender}${expiryDate}${checkDigit(
      expiryDate,
    )}`;

    if (codeLine2.length) {
      const filler = "<".repeat(MRZ_TD3_LINE_LENGTH - 2 - codeLine2.length);
      codeLine2 += filler;
      codeLine2 += checkDigit(filler);

      // Composite check digit for characters of machine readable data of the lower line in positions 1 to 10, 14 to 20 and 22 to 43, including values for
      // letters that are a part of the number fields and their check digits.
      const compositeCheckDigit = checkDigit(
        codeLine2.substring(0, 10) +
          codeLine2.substring(13, 20) +
          codeLine2.substring(21, 43),
      );
      codeLine2 += compositeCheckDigit.replace(/[-]/g, "<");
    }

    return `${codeLine1}\n${codeLine2}`.toUpperCase();
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function checkDigit(inputData) {
  // http://www.highprogrammer.com/alan/numbers/mrp.html#checkdigit
  let multiplier = 7;
  let total = 0;
  for (const char of inputData) {
    total += checkDigitDiagram[char] * multiplier;
    if (multiplier === 7) multiplier = 3;
    else if (multiplier === 3) multiplier = 1;
    else if (multiplier === 1) multiplier = 7;
  }

  const result = total % 10;
  return result.toString();
}

const checkDigitDiagram = {
  "<": 0,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 18,
  J: 19,
  K: 20,
  L: 21,
  M: 22,
  N: 23,
  O: 24,
  P: 25,
  Q: 26,
  R: 27,
  S: 28,
  T: 29,
  U: 30,
  V: 31,
  W: 32,
  X: 33,
  Y: 34,
  Z: 35,
};
module.exports = {
  hijriYear,
  findConfig,
  findGorillaConfig,
  commit,
  controller,
  commander,
  initPage,
  useCounter,
  commitFile,
  captchaClick,
  downloadImage,
  photosFolder,
  passportsFolder,
  residencyFolder,
  vaccineFolder,
  isCodelineLooping,
  endCase,
  setCounter,
  selectByValue,
  selectByValueStrict,
  selectPrimeDropdownByText,
  setInputValue,
  sniff,
  newPage,
  handleMofa,
  mofaData,
  getMofaData,
  waitForCaptcha,
  waitForPageCaptcha,
  VISION_DEFICIENCY,
  downloadAndResizeImage,
  commitCaptchaToken,
  commitCaptchaTokenWithSelector,
  commitNormalCaptchaWithSelector,
  getIssuingCountry,
  premiumSupportAlert,
  getOverridePath,
  getSelectedTraveler,
  incrementSelectedTraveler,
  setSelectedTraveller,
  resetLastHandledUrl,
  shouldDispatchRoute,
  infoMessage,
  statusMessage,
  pauseMessage,
  pauseForInteraction,
  getLogFile,
  suggestGroupName,
  screenShotAndContinue,
  toggleBlur,
  isTravelDocument,
  screenShotToKea,
  remember,
  recall,
  getCurrentTime,
  SolveIamNotARobot,
  registerLoop,
  downloadPDF,
  clickWhenReady,
  pdfToKea,
  generateMRZ,
};
