let logger = {};
logger.init = function (filePath) {
  console.setGlobalLogConfig({
    'file': filePath
  });
};
logger.debug = function () {
  console.log(...arguments);
};
logger.info = function () {
  console.info(...arguments);
  toast(...arguments);
};
logger.warning = function () {
  console.warn(...arguments);
  toast(...arguments);
};
logger.error = function () {
  console.error(...arguments);
  toast(...arguments);
};
logger.trace = function () {
  console.trace(...arguments);
}
logger.attr = function (name, text) {
  logger.debug(`[${name}] ${text}`);
};
logger.hr = function (message) {
  logger.debug(`=== ${message.toUpperCase()} ===`);
};

module.exports = logger;