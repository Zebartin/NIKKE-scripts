const { LaunchAppError } = require("../base/error");
const logger = require("../base/logger");

class AppControl {
  constructor() {
    let appOps = context.getSystemService(android.content.Context.APP_OPS_SERVICE);
    let mode = appOps.checkOpNoThrow(android.app.AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.getPackageName());
    this.hasUsageStatsPermission = mode == android.app.AppOpsManager.MODE_ALLOWED;
    if (this.hasUsageStatsPermission === false) {
      logger.warning('Autox.js does not have permission to get usage stats');
    }
  }
  appStart(appName) {
    for (let i = 0; i < 5; i++) {
      if (app.launchApp(appName)) {
        if (this.hasUsageStatsPermission) {
          waitForPackage(getPackageName(appName));
        }
        logger.debug(`${appName} starts`);
        return;
      }
      sleep(500);
    }
    throw new LaunchAppError(`Failed to launch ${appName}`);
  }
  appStop(appName) {
    let name = getPackageName(appName);
    app.openAppSetting(name);
    while (text(appName).findOne(2000) == null) {
      back();
      app.openAppSetting(name);
    }
    let is_sure = textMatches(/.*(强行|停止|结束).{0,3}/).findOne(2000);
    while (is_sure != null && !is_sure.clickable())
      is_sure = is_sure.parent();
    if (is_sure == null) {
      logger.warning(`${appName} can not be stopped`);
    } else if (!is_sure.enabled()) {
      logger.warning(`${appName} is not running`);
    } else {
      is_sure.click();
      let confirm = textMatches(/(确[定认])/).findOne(2000);
      if (confirm === null) {
        confirm = textMatches(/(强行|停止|结束).{0,3}/);
      }
      confirm.click();
      logger.debug(`${appName} is stopped`);
    }
    back();
    home();
    sleep(500);
  }
  appIsRunning(appName) {
    if (!this.hasUsageStatsPermission) {
      return true;
    }
    return currentPackage() == getPackageName(appName);
  }
}

module.exports = AppControl;