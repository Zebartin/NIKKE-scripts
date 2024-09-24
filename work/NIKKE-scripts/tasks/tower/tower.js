const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const { pageTower, pageArk, pageMain } = require('../base/page');
const { MANUFACTURER_TOWER_OPEN, MANUFACTURER_TOWER_CLOSE, TOWER_NAME, TOWER_LIMIT, TOWER_STAGE } = require('./assets/tower');
const Combat = require('../handlers/combat');

class Tower extends Combat {
  run() {
    this.uiEnsure(pageTower);
    let towers = this.#getManufacturerTowers();
    for (let i = 0; i < towers.length; ++i) {
      this.#cleanOneTower(towers[i]);
      if (i != towers.length - 1) {
        this.#backToTowerHome();
      }
    }
    this.config.taskDelay(true);
  }
  #getManufacturerTowers() {
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(MANUFACTURER_TOWER_OPEN)) {
        let open = MANUFACTURER_TOWER_OPEN.matchMultiText(this.device.image, this.device.ocrResult);
        let close = MANUFACTURER_TOWER_CLOSE.matchMultiText(this.device.image, this.device.ocrResult);
        if (open.length + close.length == 4)
          return open;
        continue;
      }
    }
  }
  #cleanOneTower(entrance) {
    let skipFirstScreenshot = true;
    let clickInterval = new Timer(2000, 2);
    let checked = false;
    let limit = null;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (checked) {
        if (this.appear(TOWER_STAGE))
          break;
      } else {
        if (this.appear(TOWER_NAME) && this.appear(TOWER_LIMIT)) {
          checked = true;
          limit = parseInt(TOWER_LIMIT.text.match(TOWER_LIMIT.matchedText)[1]);
          logger.info(`${TOWER_NAME.text}(${limit}/3)`);
          if (limit === 0)
            return;
          continue;
        }
        if (clickInterval.reachedAndReset()) {
          this.device.click(entrance);
          continue;
        }
      }
    }
    let completed = 0;
    for (let i = 1; i <= limit; ++i) {
      let handleSucceeded = () => this.handleSucceeded(TOWER_NAME, i < limit);
      let handleFailed = () => this.handleFailed(TOWER_NAME);
      let succeeded = this.executeCombat(TOWER_STAGE, TOWER_NAME, handleSucceeded, handleFailed);
      if (!succeeded)
        break;
      completed++;
    }
    logger.info(`${TOWER_NAME.text}完成：${completed + 3 - limit}/3`);
  }
  #backToTowerHome() {
    let skipFirstScreenshot = true;
    let pages = [pageTower, pageArk, pageMain];
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.handleSale())
        continue;
      if (!this.appear(TOWER_LIMIT)) {
        let checked = false;
        for (let p of pages)
          if (this.uiPageAppear(p)) {
            checked = true;
            break;
          }
        if (checked)
          break;
      }
      this.device.back();
    }
    this.uiEnsure(pageTower);
  }
}

module.exports = Tower;