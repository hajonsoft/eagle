const util = require("../../util");

function createPageContentHandler({
  routes,
  getRouteName = (currentConfig) => currentConfig?.name,
  beforeEach,
  onUnknown,
}) {
  return async function pageContentHandler(currentConfig, context = {}) {
    const routeName = getRouteName(currentConfig);

    if (!routeName) {
      if (typeof onUnknown === "function") {
        await onUnknown(currentConfig, context);
      }
      return;
    }

    if (typeof beforeEach === "function") {
      const shouldContinue = await beforeEach(currentConfig, context);
      if (shouldContinue === false) {
        return;
      }
    }

    const handler = routes[routeName];
    if (!handler) {
      if (typeof onUnknown === "function") {
        await onUnknown(currentConfig, context);
      }
      return;
    }

    await handler(currentConfig, context);
  };
}

function createOnContentLoaded({
  getPage,
  config,
  pageContentHandler,
  beforeFindConfig,
  onMissingConfig,
  onError,
}) {
  return async function onContentLoaded() {
    try {
      if (typeof beforeFindConfig === "function") {
        await beforeFindConfig();
      }

      const currentPage = await getPage();
      if (!currentPage || typeof currentPage.url !== "function") {
        console.log(
          "[listeners] onContentLoaded skipped because the page is not ready yet.",
        );
        return;
      }

      const currentUrl = await currentPage.url();
      if (!currentUrl || currentUrl === "about:blank") {
        return;
      }

      const currentConfig = util.findConfig(currentUrl, config);

      if (!currentConfig?.name) {
        if (typeof onMissingConfig === "function") {
          await onMissingConfig(currentConfig);
        }
        return;
      }

      await pageContentHandler(currentConfig, { url: currentUrl });
      return true;
    } catch (error) {
      if (typeof onError === "function") {
        await onError(error);
      } else {
        console.log(error);
      }
      return false;
    }
  };
}

module.exports = {
  createPageContentHandler,
  createOnContentLoaded,
};
