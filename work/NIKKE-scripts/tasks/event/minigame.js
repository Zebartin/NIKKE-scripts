const logger = require('../../../../common/base/logger');
const Timer = require('../../../../common/base/timer');
const { randomRectPoint } = require('../../../../common/base/utils');
const { pageMiniGame } = require('../base/page');
const NikkeUI = require('../base/ui');
const { START, IN_GAME_CHECK, LEFT, RIGHT, CAKE_1, CAKE_2, CAKE_SP, BOMB_1, BOMB_2 } = require('./assets/minigame');

class MiniGame extends NikkeUI {
  run() {
    this.#enterMiniGame();
    this.#initButtons();
    this.#playGame();
    this.config.taskDelay(true);
  }
  #enterMiniGame() {
    this.uiEnsure(pageMiniGame);
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(IN_GAME_CHECK))
        break;
      if (this.appearThenClick(START, 1500, 2))
        continue;
    }
    new Timer(2000).start().wait();
  }
  #clickLeft(waitTime = 50) {
    this.device.click(LEFT);
    if (waitTime)
      sleep(waitTime);
  }
  #clickRight(waitTime = 50) {
    this.device.click(RIGHT);
    if (waitTime)
      sleep(waitTime);
  }
  #clickBoth(waitTime = 50) {
    let [lx, ly] = randomRectPoint(LEFT.button);
    let [rx, ry] = randomRectPoint(RIGHT.button);
    logger.debug(`Click (${lx}, ${ly}) (${rx}, ${ry}) @ 左右`);
    gestures(
      [0, 200, [lx, ly], [lx, ly]],
      [0, 200, [rx, ry], [rx, ry]]
    );
    if (waitTime)
      sleep(waitTime);
  }
  #initButtons() {
    let timeout = new Timer(5000, 10).start();
    let skipFirstScreenshot = true;
    let leftChecked = false, rightChecked = false;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot(false);
      if (timeout.reached()) {
        let failed = '';
        if (!leftChecked)
          failed += '左';
        if (!rightChecked)
          failed += '右';
        throw new Error(`未匹配到${failed}按钮`);
      }
      if (this.appear(LEFT))
        leftChecked = true;
      if (this.appear(RIGHT))
        rightChecked = true;
      if (leftChecked && rightChecked)
        break;
    }
  }
  #playGame() {
    for (let b of [CAKE_1, CAKE_2, CAKE_SP, BOMB_1, BOMB_2]) {
      let o = b.getRegion(this.device.image);
      let area = new android.graphics.Rect(
        o[0], o[1], o[0] + o[2], o[1] + o[3]
      );
      area.bottom = LEFT.button.top;
      b.setRegion(area);
    }
    this.device.disableStuckDetection();
    let spClicked = false;
    while (true) {
      this.device.screenshot(false);
      let cake_sp = this.appear(CAKE_SP);
      if (cake_sp) {
        this.#clickLeft();
        spClicked = true;
        continue;
      }
      let cake = this.appear(CAKE_1) || this.appear(CAKE_2);
      let bomb = this.appear(BOMB_1) || this.appear(BOMB_2);
      let clickMethod = null;
      if (cake && bomb)
        clickMethod = this.#clickBoth;
      else if (cake)
        clickMethod = this.#clickLeft;
      else if (bomb)
        clickMethod = this.#clickRight;
      if (clickMethod !== null) {
        clickMethod = clickMethod.bind(this);
        if (spClicked) {
          logger.debug('连点');
          for (let i = 0; i < 5; ++i)
            clickMethod(0);
          logger.debug('连点结束');
          spClicked = false;
        }
        clickMethod();
      }
    }
  }
}

module.exports = MiniGame;