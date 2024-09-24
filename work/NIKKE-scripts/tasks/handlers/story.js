const { detectContours } = require('../../../../common/base/utils');
const { Button } = require('../../../../common/base/button');
const NikkeUI = require('../base/ui');
const { STORY_CHECK, SKIP, CLICK_ANYWHERE, CANCEL } = require('./assets/story');
const Timer = require('../../../../common/base/timer');

class Story extends NikkeUI {
  #clickInterval;
  #specialOptions;
  constructor(config, device) {
    super(config, device);
    this.#clickInterval = new Timer(800);
  }
  isStoryOngoing() {
    return this.appear(STORY_CHECK);
  }
  isStoryCanSkip() {
    return this.appear(SKIP);
  }
  handleStorySkip() {
    return this.#handleStory(SKIP);
  }
  handleStoryCancel() {
    return this.#handleStory(CANCEL, true);
  }
  /**
   * 
   * @returns {Rect[]}
   */
  storyStopAtSpecialOptions() {
    this.#specialOptions = [];
    let skipFirstScreenshot = true;
    let timeout = new Timer(3000, 5).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.isStoryOngoing()) {
        timeout.reset();
      } else if (timeout.reached()) {
        return [];
      }
      if (this.#specialOptions.length > 0)
        return this.#specialOptions;
      if (this.#handleStory(null, true))
        continue;
    }
  }
  #handleStory(clickButton, stopAtSpecialOptions = false) {
    if (!this.isStoryOngoing())
      return false;
    if (clickButton && this.appear(clickButton)) {
      if (this.appearThenClick(clickButton, 1000, 2)) {
        this.#clickInterval.reset();
        return true;
      }
      return false;
    }
    let options = detectContours(
      this.device.image, [0, this.device.height / 2],
      [35, 55], 'BINARY_INV', this.#optionFilter.bind(this)
    );
    if (options.length > 0) {
      this.#clickRandomOption(options);
      return true;
    }
    this.#specialOptions = detectContours(
      this.device.image, [0, this.device.height / 2],
      [35, 55], 'BINARY', this.#optionFilter.bind(this)
    );
    if (this.#specialOptions.length > 0) {
      if (stopAtSpecialOptions)
        return false;
      this.#clickRandomOption(this.#specialOptions);
      return true;
    }
    if (this.#clickInterval.reachedAndReset()) {
      this.device.clickRecordClear();
      this.device.click(CLICK_ANYWHERE);
      return true;
    }
    return false;
  }
  /**
   * 
   * @param {Rect} rect 
   */
  #optionFilter(rect) {
    let middle = this.device.width / 2;
    return rect.width() > this.device.width * 0.7 &&
      rect.left < middle && rect.right > middle &&
      rect.height() < 200;
  }
  #clickRandomOption(options) {
    let option = new Button('剧情选项', null, 0.8);
    let index = Math.floor(Math.random() * options.length);
    option.button = options[index];
    this.device.click(option);
  }
}

module.exports = Story;