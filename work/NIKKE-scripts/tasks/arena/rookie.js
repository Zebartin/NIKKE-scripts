const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const NikkeUI = require('../base/ui');
const { pageArena, pageRookieArena } = require('../base/page');
const { ROOKIE_ARENA, ROOKIE_ARENA_CHECK } = require('../base/assets/page');
const { FREE_ENTER, ENTER_FIGHT_PREPARE_CHECK, FIGHT_OVER, FIGHT_WIN, FIGHT_LOSE, ENTER_FIGHT_PREPARE, ENTER_FIGHT, SEASON_OVER } = require('./assets/rookie');

class RookieArena extends NikkeUI {
  run() {
    if (this.#enterRookieArena()) {
      for (let i = 0; i < 10; ++i)
        if (!this.#fight())
          break;
    }
    this.config.taskDelay(true);
  }
  #enterRookieArena(skipFirstScreenshot = true) {
    if (this.uiPageAppear(pageRookieArena))
      return true;
    this.uiEnsure(pageArena);
    let timeout = new Timer(10000, 5).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('无法进入新人竞技场');
        return false;
      }
      if (this.appear(SEASON_OVER)) {
        logger.debug('赛季结束');
        return false;
      }
      if (this.uiPageAppear(pageRookieArena))
        return true;
      if (this.appearThenClick(ROOKIE_ARENA, 2000, 2))
        continue;
    }
  }
  get fightTargetIndex() {
    let ret = this.config.RookieArena_Target || 0;
    if (ret === 0) {
      return Math.floor(Math.random() * 3);
    }
    return ret - 1;
  }
  #fight(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(FIGHT_OVER)) {
        for (let button of [FIGHT_WIN, FIGHT_LOSE]) {
          if (this.appear(button)) {
            logger.debug(`结果：${button.name}`);
            break;
          }
        }
        this.device.logOcrResult();
        break;
      }
      if (this.appear(ENTER_FIGHT_PREPARE_CHECK) && this.appearThenClick(ENTER_FIGHT, 2000, 2))
        continue;
      if (this.appear(ROOKIE_ARENA_CHECK, 2000, 2)) {
        let entrances = ENTER_FIGHT_PREPARE.matchMultiText(this.device.image, this.device.ocrResult);
        if (entrances.length == 3) {
          // Is this reliable?
          if (!this.appear(FREE_ENTER)) {
            logger.debug('免费次数已耗尽');
            return false;
          }
          this.device.click(entrances[this.fightTargetIndex]);
        }
        continue;
      }
    }
    skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(ROOKIE_ARENA_CHECK))
        break;
      if (this.appearThenClick(FIGHT_OVER, 2000, 2))
        continue;
    }
    this.device.clickRecordClear();
    return true;
  }
}
module.exports = RookieArena;