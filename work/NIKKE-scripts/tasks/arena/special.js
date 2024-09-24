const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const NikkeUI = require('../base/ui');
const { pageArena, pageSpecialArena } = require('../base/page');
const { SPECIAL_ARENA } = require('../base/assets/page');
const { TOUCH, ATK, SPEICAL_ARENA_TITLE, CLAIM, TEAM_UP_PAGE, SEASON_OVER } = require('./assets/special');

class SpecialArena extends NikkeUI {
  run() {
    this.uiEnsure(pageArena);
    if (this.#enterSpecialArena()) {
      this.claimReward();
    }
    this.config.taskDelay(false, null, 60);
  }
  #enterSpecialArena(skipFirstScreenshot = true) {
    let timeout = new Timer(10000, 5).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('无法进入特殊竞技场');
        return false;
      }
      if (this.appear(SEASON_OVER)) {
        logger.debug('赛季结束');
        return false;
      }
      if (this.uiPageAppear(pageSpecialArena))
        return true;
      if (this.appearThenClick(SPECIAL_ARENA, 2000, 2))
        continue;
      if (this.appear(TEAM_UP_PAGE)) {
        this.device.back();
        continue;
      }
    }
  }
  claimReward(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(CLAIM))
        break;
      if (this.appear(TEAM_UP_PAGE)) {
        this.device.back();
        continue;
      }
      if (this.appear(ATK) && this.appear(SPEICAL_ARENA_TITLE)) {
        this.appearThenClick(TOUCH, 1000, 2);
        continue;
      }
    }
    skipFirstScreenshot = true;
    let timeout = new Timer(5000, 2).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached() && this.uiPageAppear(pageSpecialArena))
        break;
      if (this.appearThenClick(CLAIM, 2000, 2)) {
        timeout.reset();
        continue;
      }
      if (this.handleReward()) {
        timeout.clear();
        continue;
      }
    }
  }
}

module.exports = SpecialArena;