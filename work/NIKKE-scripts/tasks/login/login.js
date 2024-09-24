const NikkeUI = require('../base/ui');
const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const { TOUCH_TO_CONTINUE, DOWNLOADING, NEED_PASSWORD, UNDER_MAINTENANCE } = require('./assets/login');
const constructMagic = require('./magic');
const { GameNotRunningError, GameNotLoginError, GameUnderMaintenanceError } = require('../base/error');
const { limitIn } = require('../../../../common/base/utils');
const pages = require('../base/page');

class Login extends NikkeUI {
  #ensureOrientation() {
    let checkInterval = new Timer(1000);
    let timeout = new Timer(30 * 1000).start();
    while (true) {
      checkInterval.wait();
      checkInterval.reset();
      if (timeout.reached())
        throw new GameNotRunningError('游戏未进入竖屏状态');
      if (this.device.getOrientation() == 'portrait')
        return;
    }
  }
  #handleNikkeLogin() {
    logger.hr('妮姬，启动！');
    this.#ensureOrientation();
    let startUpTimer = new Timer(5000).start();
    let appAliveTimer = new Timer(5000).start();
    let logInterval = new Timer(15000, 3);
    let downloadTimer = new Timer(8000);
    while (true) {
      if (appAliveTimer.reached()) {
        if (!this.device.appIsRunning('NIKKE'))
          throw new GameNotRunningError('游戏似乎闪退了');
        appAliveTimer.reset();
      }
      startUpTimer.wait();
      downloadTimer.wait();
      this.device.screenshot();
      // should not use Page.allPages here
      for (let page of Object.values(pages)) {
        if (this.uiPageAppear(page)) {
          logger.debug(`进入页面：${page.name}`);
          return;
        }
      }
      if (this.appear(NEED_PASSWORD))
        throw new GameNotLoginError('需要密码登录');
      if (this.appear(UNDER_MAINTENANCE))
        throw new GameUnderMaintenanceError('游戏正在维护');
      if (this.appear(DOWNLOADING, 10000)) {
        logger.debug('正在下载……');
        logInterval.reset();
        downloadTimer.reset();
        this.device.stuckRecordClear();
        continue;
      }
      if (this.appearThenClick(TOUCH_TO_CONTINUE))
        continue;
      if (this.handleReward())
        continue;
      if (this.handleConfirm())
        continue;
      if (this.uiAdditional())
        continue;
      if (this.uiGoToMain())
        continue;
      if (logInterval.reachedAndReset())
        logger.debug('游戏加载中……');
    }
  }
  #checkMute() {
    if (!this.config.General_Mute)
      return;
    try {
      device.setMusicVolume(0);
    } catch (error) {
      if (error.message.includes('系统设置权限'))
        toastLog('需要为AutoX.js打开修改系统设置权限');
      else
        toastLog(error);
    }
  }
  handleNikkeLogin() {
    this.#checkMute();
    let oldTimer = this.device.stuckTimer;
    let longerInterval = limitIn(this.config.General_ScreenshotInterval * 10, 2000, 6000);
    this.device.setScreenshotInnterval(longerInterval);
    this.device.stuckTimer = new Timer(480 * 1000, 300).start();
    try {
      this.#handleNikkeLogin();
    } finally {
      this.device.setScreenshotInnterval();
      this.device.stuckTimer = oldTimer.reset();
    }
  }
  get magic() {
    let magicName = this.config.General_Magic;
    if (!magicName)
      magicName = '无';
    logger.attr('魔法', magicName);
    return constructMagic(this.device, magicName);
  }
  appStop() {
    logger.hr('关闭妮姬');
    this.device.appStop('NIKKE');
    this.magic.close();
  }
  appStart() {
    logger.hr('打开妮姬');
    this.magic.open();
    this.device.appStart('NIKKE');
    this.handleNikkeLogin();
    this.config.taskDelay(true);
  }
  appRestart(directlyRestart = true) {
    if (!directlyRestart && this.device.appIsRunning('NIKKE') && this.device.getOrientation() == 'portrait') {
      logger.debug('尝试回退到游戏大厅……');
      let timeout = new Timer(30 * 1000).start();
      while (true) {
        this.device.screenshot();
        if (timeout.reached()) {
          logger.debug('超时');
          break;
        }
        if (this.uiPageAppear(pages.pageMain))
          return;
        if (this.handleConfirm())
          continue;
        if (this.uiGoToMain())
          continue;
        if (this.handleReward())
          continue;
      }
    }
    let magic = this.magic;
    logger.hr('重启妮姬');
    this.device.appStop('NIKKE');
    magic.close();
    magic.open();
    this.device.appStart('NIKKE');
    this.handleNikkeLogin();
  }
}

module.exports = Login;