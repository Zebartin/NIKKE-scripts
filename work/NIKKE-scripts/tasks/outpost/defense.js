const NikkeUI = require('../base/ui');
const logger = require('../../../../common/base/logger');
const { WIPE_OUT, DO_WIPE_OUT, COST_GEM, WIPE_OUT_GUIDE, CLAIM_REWARD } = require('./assets/defense');
const { pageOutpostDefense, pageMain, pageOutpost } = require('../base/page');
const Timer = require('../../../../common/base/timer');

class OutpostDefense extends NikkeUI {
  wipeOut(skipFirstScreenshot = true) {
    this.uiEnsure(pageOutpostDefense);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(WIPE_OUT_GUIDE))
        break;
      if (this.appearThenClick(WIPE_OUT, 1000, 2))
        continue;
    }
    skipFirstScreenshot = true;
    let claimed = false;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(COST_GEM))
        break;
      if (this.appear(WIPE_OUT_GUIDE)) {
        if (claimed)
          break;
        this.appearThenClick(DO_WIPE_OUT, 2000);
        continue;
      }
      if (this.handleReward()) {
        claimed = true;
        continue;
      }
    }
    skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.uiPageAppear(pageOutpostDefense))
        break;
      this.device.back();
    }
    this.config.taskDelay(true);
  }
  claimReward(skipFirstScreenshot = true) {
    this.uiEnsure(pageOutpostDefense);
    let timeout = new Timer(20000, 10).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('获取基地奖励超时');
        break;
      }
      if (this.uiPageAppear(pageMain) || this.uiPageAppear(pageOutpost))
        break;
      if (this.appearThenClick(CLAIM_REWARD, 2000, 2))
        continue;
      if (this.handleReward(2000))
        continue;
    }
    this.config.taskDelay(false, null, 60);
  }
}

module.exports = OutpostDefense;