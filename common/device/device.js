const Deque = require('collections/deque');
const Timer = require('../base/timer');
const { Button } = require('../base/button');
const { randomRectPoint, scaleRect } = require('../base/utils');
const { StuckError, NotRunningError, TooManyClicksError } = require('../base/error');
const Screenshot = require('./screenshot');
const AppControl = require('./app-control');
const Config = require('../config/config');
const logger = require('../base/logger');

class Device extends Screenshot {
  #appControl;
  #backInterval;
  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    super(config);
    this.detectRecord = new Set();
    this.clickRecord = new Deque([], 16);
    this.stuckTimer = new Timer(60 * 1000, 60).start();
    this.#appControl = new AppControl();
    this.#backInterval = new Timer(1000, 2);
    // this.setScreenshotInnterval();
  }
  screenshot(ocr = true) {
    this.stuckRecordCheck();
    return super.screenshot(ocr);
  }
  /**
   * @param {Button} button 
   */
  stuckRecordAdd(button) {
    this.detectRecord.add(button.name);
  }
  stuckRecordClear() {
    this.detectRecord.clear();
    this.stuckTimer.reset();
  }
  stuckRecordCheck() {
    if (!this.stuckTimer.reached()) {
      return false;
    }
    let stuckRecord = Array.from(this.detectRecord);
    this.stuckRecordClear();
    if (this.appIsRunning())
      throw new StuckError(`Wait too long for ${stuckRecord}`);
    else
      throw new NotRunningError('App died');
  }
  disableStuckDetection() {
    logger.debug('Disable stuck detection');
    this.clickRecordCheck = () => {};
    this.stuckRecordCheck = () => {};
  }
  /**
   * @param {Button} button 
   */
  clickRecordAdd(button) {
    this.clickRecord.push(button.name);
  }
  clickRecordClear() {
    this.clickRecord.clear();
  }
  clickRecordCheck() {
    let count = {};
    this.clickRecord.forEach(buttonName => {
      count[buttonName] = (count[buttonName] || 0) + 1;
    });
    count = Object.entries(count).sort((a, b) => b[1] - a[1]);
    if (count[0][1] >= 12) {
      console.warn(`History clicks: [${this.clickRecord.toArray().map(x => `"${x}"`)}]`);
      this.clickRecordClear();
      throw new TooManyClicksError(`Too many clicks for one button: "${count[0][0]}"`);
    }
    if (count.length > 2 && count[0][1] >= 6 && count[1][1] >= 6) {
      console.warn(`History clicks: ${this.clickRecord.toArray()}`);
      this.clickRecordClear();
      throw new TooManyClicksError(`Too many clicks for between 2 buttons: ${count[0][0]}, ${count[1][0]}`);
    }
  }
  /**
   * @param {Button} button 
   */
  handleControlCheck(button) {
    this.stuckRecordClear();
    this.clickRecordAdd(button);
    this.clickRecordCheck();
  }
  appStart(appName) {
    this.appName = appName;
    this.#appControl.appStart(appName);
    this.stuckRecordClear();
    this.clickRecordClear();
  }
  appStop(appName) {
    if (appName === null)
      appName = this.appName;
    this.#appControl.appStop(appName);
    this.stuckRecordClear();
    this.clickRecordClear();
  }
  appIsRunning(appName) {
    if (appName === null)
      appName = this.appName;
    return this.#appControl.appIsRunning(appName);
  }
  back() {
    if (this.#backInterval.reached()) {
      this.#backInterval.reset();
      logger.debug('Back');
      back();
    }
  }
  /**
   * @param {Button} button 
   */
  click(button) {
    this.handleControlCheck(button);
    if (button.name === 'BACK') {
      this.back();
      return;
    }
    this.#backInterval.clear();
    if (button.button === null && Array.isArray(button.search)) {
      let w = this.width, h = this.height;
      button.button = new android.graphics.Rect(
        button.search[0] * w, button.search[1] * h,
        button.search[2] * w, button.search[3] * h
      );
    }
    let [x, y] = randomRectPoint(button.button);
    logger.debug(`Click (${x}, ${y}) @ ${button.name}`);
    click(x, y);
  }
  /**
   * 
   * @param {Rect} area 
   * @param {string} direction up/down/left/right
   * @param {number} duration 
   */
  swipe(area, direction = 'up', duration = 500) {
    let areaScaled = scaleRect(area, 0.6);
    let [x, y] = randomRectPoint(areaScaled);
    let x1, y1, x2, y2;
    if (direction == 'up') {
      x1 = x2 = x;
      y1 = area.bottom;
      y2 = area.top;
    } else if (direction == 'down') {
      x1 = x2 = x;
      y1 = area.top;
      y2 = area.bottom;   
    } else if (direction == 'left') {
      x1 = area.right;
      x2 = area.left;
      y1 = y2 = y;
    } else if (direction == 'right') {
      x1 = area.left;
      x2 = area.right;
      y1 = y2 = y;
    }
    logger.debug(`Swipe (${x1}, ${y1}) -> (${x2}, ${y2})`);
    swipe(x1, y1, x2, y2, duration);
  }
  /**
   * 
   * @param {Rect} area 
   * @param {string} direction up or down
   */
  dragVertical(area, direction = 'up') {
    let areaScaled = scaleRect(area, 0.6);
    let [x, y] = randomRectPoint(areaScaled);
    let start = area.bottom, end = area.top;
    if (direction != 'up') {
      start = area.top;
      end = area.bottom;
    }
    logger.debug(`Drag (${x}, ${start}) -> (${x}, ${end})`);
    gestures(
      [0, 500, [x, start], [x, end]],
      [600, 200, [areaScaled.left, y], [areaScaled.right, y]]
    );
  }
  /**
   * 
   * @param {Rect} area 
   * @param {string} direction left or right
   */
  dragHorizontal(area, direction = 'left') {
    let areaScaled = scaleRect(area, 0.6);
    let [x, y] = randomRectPoint(areaScaled);
    let start = area.right, end = area.left;
    if (direction != 'left') {
      start = area.left;
      end = area.right;
    }
    logger.debug(`Drag (${start}, ${y}) -> (${end}, ${y})`);
    gestures(
      [0, 500, [start, y], [end, y]],
      [600, 200, [x, areaScaled.top], [x, areaScaled.bottom]]
    );
  }
}

module.exports = Device;