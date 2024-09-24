/*
const BulletinBoard = require('./tasks/outpost/bulletin');
let t = new BulletinBoard('NIKKEconfig');
t.run(); 
*/
const Timer = require("../../../../common/base/timer");
const logger = require("../../../../common/base/logger");
const { pageBulletinBoard } = require("../base/page");
const NikkeUI = require("../base/ui");
const { NO_MISSION, SOME_MISSION, CLAIM_ALL, DISPATH_ALL, DISPATCH_CANCEL, DISPATCH_CONFIRM } = require("./assets/bulletin");

class BulletinBoard extends NikkeUI {
  #canDispatch;
  #canClaim;
  run() {
    this.uiEnsure(pageBulletinBoard);
    if (!this.#waitUntilMissionLoaded()) {
      this.config.taskDelay(true);
      return;
    }
    if (this.#canClaim) {
      this.claim();
      if (!this.#waitUntilMissionLoaded()) {
        this.config.taskDelay(true);
        return;
      }
    }
    if (this.#canDispatch)
      this.dispatch();
    this.config.taskDelay(false, null, 60);
  }
  #waitUntilMissionLoaded(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(NO_MISSION)) {
        logger.debug('目前没有可进行的派遣任务');
        return false;
      }
      if (this.appear(SOME_MISSION))
        break;
    }
    this.#checkButtonsStatus();
    return true;
  }
  #checkButtonsStatus(skipFirstScreenshot = true) {
    this.#canDispatch = false;
    this.#canClaim = false;
    let timeout = new Timer(2000, 1).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached())
        break;
      if (this.appear(CLAIM_ALL) && this.appear(DISPATH_ALL)) {
        // blue
        if (this.imageColorCount(CLAIM_ALL, '#00aeff', 221, 3000))
          this.#canClaim = true;
        if (this.imageColorCount(DISPATH_ALL, '#00aeff', 221, 300))
          this.#canDispatch = true;
        if (this.#canClaim || this.#canDispatch)
          break;
      }
    }
    let status = ['可领取奖励', '可派遣'];
    if (!this.#canClaim)
      status[0] = '不' + status[0];
    if (!this.#canDispatch)
      status[1] = '不' + status[1];
    logger.attr('派遣公告栏', status.join('，'));
  }
  claim() {
    let skipFirstScreenshot = true;
    let timeout = new Timer(10000, 5).start();
    let confirmTimer = new Timer(2000, 2).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('领取派遣奖励超时');
        break;
      }
      if (confirmTimer.reached() && this.appear(CLAIM_ALL) && this.imageColorCount(CLAIM_ALL, [206, 206, 206], 221, 5000))
        break;
      if (this.appearThenClick(CLAIM_ALL, 2000, 2)) {
        confirmTimer.reset();
        continue;
      }
      if (this.handleReward()) {
        confirmTimer.clear()
        continue;
      }
    }
  }
  dispatch() {
    let skipFirstScreenshot = true;
    let timeout = new Timer(10000, 3).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('派遣任务超时');
        return;
      }
      if (this.appear(DISPATCH_CANCEL))
        break;
      if (this.appearThenClick(DISPATH_ALL, 2000, 2))
        continue;
    }
    skipFirstScreenshot = true;
    timeout.reset();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('派遣任务超时');
        return;
      }
      if (this.appear(DISPATH_ALL) && !this.imageColorCount(DISPATH_ALL, '#00aeff', 221, 300))
        break;
      if (this.appearThenClick(DISPATCH_CONFIRM, 2000, 2))
        continue;
    }
  }
}

module.exports = BulletinBoard;
