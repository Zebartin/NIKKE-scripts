const { areaOffset, limitIn } = require('../../../../common/base/utils');
const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const Story = require('./story');
const { ENTER_COMBAT, COMBAT_AUTO, COMBAT_FAILED, CLICK_TO_NEXT, CLICK_ANYWHERE: CLICK_ANY, NEXT_COMBAT, BACK_FROM_FAILURE } = require('./assets/combat');

class Combat extends Story {
  #isFastCombat = false;
  static autoAimChecked = false;
  static autoBurstChecked = false;

  isCombatEntrance() {
    return this.appear(ENTER_COMBAT);
  }
  isCombatExecuting() {
    return this.appear(COMBAT_AUTO);
  }
  /**
   * 
   * @param {function} expectedEnd 
   * @returns {boolean} has next combat or not
   */
  executeCombat(entrance = null, expectedOut = null, handleSucceeded = null, handleFailed = null) {
    this.#enterCombat(entrance);
    let result = true;
    let skipFirstScreenshot = true;
    let longerInterval = limitIn(this.config.General_ScreenshotInterval * 10, 2000, 6000);
    this.device.setScreenshotInnterval(longerInterval);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(CLICK_TO_NEXT)) {
        logger.debug('战斗胜利');
        break;
      }
      if (this.appear(COMBAT_FAILED)) {
        logger.debug('战斗失败');
        result = false;
        break;
      }
      if (this.isCombatExecuting()) {
        this.device.stuckRecordClear();
        continue;
      }
      if (this.#checkAuto())
        continue;
    }
    this.device.setScreenshotInnterval();
    if (result) {
      if (handleSucceeded !== null)
        handleSucceeded();
      else
        result = this.handleSucceeded(expectedOut);
    } else {
      if (handleFailed !== null)
        handleFailed();
      else
        this.handleFailed(expectedOut);
    }
    return result;
  }
  #enterCombat(entrance = null) {
    this.#isFastCombat = false;
    let skipFirstScreenshot = true;
    let oldTimer = this.device.stuckTimer;
    this.device.stuckTimer = new Timer(180 * 1000, 100).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.isCombatExecuting()) {
        logger.debug('战斗开始');
        break;
      }
      if (entrance && this.appearThenClick(entrance, 2000, 2))
        continue;
      if (this.appearThenClick(ENTER_COMBAT, 1000, 2))
        continue;
      if (this.handleStorySkip())
        continue;
    }
    this.device.stuckTimer = oldTimer.reset();
  }
  #checkAuto() {
    return false;
  }
  handleSucceeded(expectedOut = null, checkNext = true) {
    let skipFirstScreenshot = true;
    let hasNext = false;
    if (checkNext)
      hasNext = this.#hasNextCombat();
    let clickButton = hasNext ? NEXT_COMBAT : CLICK_ANY;
    let clickInterval = new Timer(2000, 2);
    let timeout = new Timer(7000, 3).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(CLICK_TO_NEXT) && clickInterval.reachedAndReset()) {
        this.device.click(clickButton);
        continue;
      }
      if (this.isCombatExecuting()) {
        logger.debug('进入另一场战斗');
        return true;
      }
      if (this.handleStorySkip())
        continue;
      if (expectedOut !== null && this.appear(expectedOut))
        return hasNext;
      if (expectedOut === null && (timeout.reached() || !this.appear(CLICK_TO_NEXT)))
        return hasNext;
    }
  }
  #hasNextCombat() {
    let skipFirstScreenshot = true;
    let area = new android.graphics.Rect(
      this.device.width * 0.5, 0,
      this.device.width, this.device.height
    );
    let timeout = new Timer(3000, 3).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.debug(`没有找到按钮"${NEXT_COMBAT.name}"`);
        return false;
      }
      if (this.appear(CLICK_TO_NEXT)) {
        area.top = CLICK_TO_NEXT.button.bottom;
        let cropped = this.imageCrop(this.device.image, area);
        let maxScale = 6;
        let appear = false;
        for (let scale = 1; scale <= maxScale; ++scale) {
          this.device.setOcrPreprocess(cropped, scale);
          appear = this.appear(NEXT_COMBAT);
          this.device.resetOcr();
          if (appear)
            break;
        }
        cropped.recycle();
        if (appear) {
          NEXT_COMBAT.button = areaOffset(
            NEXT_COMBAT.button,
            [area.left, area.top]
          )
          if (this.imageColorCount(NEXT_COMBAT, '#000000', 221, 1000)) {
            logger.debug('“下一战斗”按钮不可点击');
            return false;
          } else {
            return true;
          }
        }
      }
    }
  }
  handleFailed(expectedOut = null) {
    let skipFirstScreenshot = true;
    let timeout = new Timer(5000, 3).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (expectedOut !== null && this.appear(expectedOut))
        return;
      if (expectedOut === null && timeout.reached() && !this.appear(BACK_FROM_FAILURE))
        return;
      if (this.appearThenClick(BACK_FROM_FAILURE, 2000, 2))
        continue;
    }
  }
}

module.exports = Combat;