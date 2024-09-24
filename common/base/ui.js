const Device = require("../device/device");
const Config = require("../config/config");
const { Button, ImageButton, TextButton } = require("./button");
const Timer = require("./timer");
const Page = require("./page");
const { PageUnknownError } = require("./error");
const logger = require("./logger");
const utils = require('./utils');

class UIBase {
  #imageFile;
  /**
   * 
   * @param {Config | string} config 
   * @param {Device?} device 
   */
  constructor(config, device) {
    if (typeof config === 'string') {
      config = new Config(config);
    }
    if (config instanceof Config) {
      this.config = config;
    } else {
      throw new Error('config must be instance of Config');
    }
    this.device = device || new Device(config);
    /** @type {Map<Button, Timer} */
    this.intervalTimers = new Map();
    this.#imageFile = null;
  }
  /**
   * @param {Button} button
   * @param {number} interval
   * @returns {boolean}
   */
  intervalReached(button, interval = 5000, count = 0) {
    if (this.intervalTimers.has(button)) {
      let t = this.intervalTimers.get(button);
      if (t.limit != interval) {
        t.limit = interval;
        t.count = count;
        t.clear();
      }
    } else {
      this.intervalTimers.set(button, new Timer(interval, count));
    }
    return this.intervalTimers.get(button).reached();
  }
  /**
   * @param {Button | Button[]} button
   * @param {number} interval
   */
  intervalReset(button, interval = 5000, count = 0) {
    if (Array.isArray(button)) {
      for (let b of button) {
        this.intervalReset(b, interval, count);
      }
      return;
    }
    if (this.intervalTimers.has(button)) {
      let t = this.intervalTimers.get(button);
      t.limit = interval;
      t.count = count;
      t.reset();
    } else {
      this.intervalTimers.set(button, new Timer(interval, count).reset());
    }
  }
  /**
   * @param {Button | Button[]} button
   * @param {number} interval
   */
  intervalClear(button, interval = 5000, count = 0) {
    if (Array.isArray(button)) {
      for (let b of button) {
        this.intervalClear(b, interval, count);
      }
      return;
    }
    if (this.intervalTimers.has(button)) {
      let t = this.intervalTimers.get(button);
      t.limit = interval;
      t.count = count;
      t.clear();
    } else {
      this.intervalTimers.set(button, new Timer(interval, count).clear());
    }
  }
  /**
   * @param {Button} button
   * @param {number} interval
   * @returns {boolean}
   */
  appear(button, interval = 0, count = 0, similarity = 0.85, minMatchCount = 4) {
    this.device.stuckRecordAdd(button);
    if (interval > 0 && !this.intervalReached(button, interval, count)) {
      return false;
    }
    let matched = true;
    if (button instanceof ImageButton) {
      matched = button.matchImage(this.device.image, similarity, minMatchCount);
    } else if (button instanceof TextButton) {
      matched = button.matchText(this.device.image, this.device.ocrResult);
    }
    if (matched && this.device.preprocessOptions != null) {
      let scale = this.device.preprocessOptions.scale;
      let rect = button.button;
      rect.left /= scale;
      rect.right /= scale;
      rect.top /= scale;
      rect.bottom /= scale;
    }
    if (matched && interval) {
      this.intervalReset(button, interval, count);
    }
    return matched;
  }
  /**
   * @param {Button} button
   * @param {number} interval
   * @returns {boolean}
   */
  appearThenClick(button, interval = 0, count = 0, similarity = 0.85, minMatchCount = 4) {
    let result = this.appear(button, interval, count, similarity, minMatchCount);
    if (result) {
      this.device.click(button);
    }
    return result;
  }
  imageColorCount(button, color, threshold = 221, count = 50) {
    if (!button.button && !this.appear(button)) {
      return false;
    }
    let cropped = this.imageCrop(this.device.image, button.button);
    log(button.name);
    let result = utils.imageColorCount(cropped, color, threshold, count);
    cropped && cropped.recycle();
    return result;
  }
  /**
   * 
   * @param {Image} image 
   * @param {Rect} rect 
   */
  imageCrop(image, rect) {
    let [x, y, w, h] = utils.buildRegion([rect.left, rect.top, rect.width(), rect.height()], image);
    return images.clip(image, x, y, w, h);
  }
  get imageFile() {
    return this.#imageFile;
  }
  set imageFile(file) {
    let image = file;
    if (typeof file == 'string' && files.exists(file)) {
      image = images.read(file);
    }
    this.device.image = image;
    this.device.ocrResult = this.device.ocr();
  }
}

class UI extends UIBase {
  /**
   * 
   * @param {Page} page 
   */
  uiPageAppear(page) {
    for (let button of page.whiteListButtons) {
      if (!this.appear(button)) {
        return false;
      }
    }
    for (let button of page.blackListButtons) {
      if (this.appear(button)) {
        return false;
      }
    }
    return true;
  }
  /**
   * 
   * @param {boolean} skipFirstScreenshot 
   * @returns {Page}
   */
  uiGetCurrentPage(skipFirstScreenshot = true) {
    logger.debug("UI get current page");
    let timeout = new Timer(20000, 20).start();
    let logInterval = new Timer(5000, 5);
    while (true) {
      if (skipFirstScreenshot) {
        skipFirstScreenshot = false;
      } else {
        this.device.screenshot();
      }
      // End
      if (timeout.reached())
        break;
      // Known pages
      for (let page of Page.allPages) {
        if (this.uiPageAppear(page)) {
          logger.attr('UI', page.name);
          return page;
        }
      }
      // Unknown but able to handle
      if (logInterval.reachedAndReset())
        logger.debug('Unknown page');
      if (this.uiAdditional()) {
        timeout.reset();
        continue;
      }
      if (this.uiGoToMain()) {
        timeout.reset();
        continue;
      }
    }
    logger.error('Starting from current page is unsupported');
    logger.error(`Supported pages: pages with "HOME" button at bottom left and [${Array.from(Page.allPages).map(p => p.name).join(', ')}]`);
    logger.error("Please switch to a supported page before starting script");
    throw new PageUnknownError();
  }
  uiGoto(destination, skipFirstScreenshot = true) {
    let routes = this.#getPageRoutes(destination);
    // Array.from(Page.allPages).forEach(page => {
    //   this.intervalClear(page.whiteListButtons);
    // });
    // log(Array.from(routes.entries()).map(x => `${x[0].name} -> ${x[1] && x[1].name}`));
    logger.debug(`UI goto ${destination.name}`);
    while (true) {
      if (skipFirstScreenshot) {
        skipFirstScreenshot = false;
      } else {
        this.device.screenshot();
      }
      if (this.uiPageAppear(destination)) {
        logger.debug(`Page arrive: ${destination.name}`);
        break;
      }
      let checked = false;
      for (let page of Array.from(routes.keys())) {
        if (routes.get(page) === null) {
          continue;
        }
        if (this.uiPageAppear(page)) {
          let nextPage = routes.get(page);
          let button = page.links.get(nextPage);
          checked = this.appear(button);
          if (this.appear(button, this.device.safeInterval)) {
            logger.debug(`Page switch: ${page.name} -> ${nextPage.name}`);
            this.device.click(button);
            this.uiButtonIntervalReset(nextPage, button);
          }
          break;
        }
      }
      if (checked) {
        continue;
      }
      if (this.uiAdditional()) {
        continue;
      }
    }
  }
  /**
   * 
   * @param {Page} destination 
   * @param {boolean} skipFirstScreenshot 
   * @returns {boolean} - whether ui is changed
   */
  uiEnsure(destination, skipFirstScreenshot = true) {
    logger.debug(`UI ensure: ${destination.name}`);
    let page = this.uiGetCurrentPage(skipFirstScreenshot);
    if (destination.equals(page)) {
      logger.debug(`Already at ${destination.name}`);
      return false;
    } else {
      this.uiGoto(destination);
      return true;
    }
  }
  /**
   * 
   * @param {Page} page 
   * @param {Button} button 
   */
  uiButtonIntervalReset(page, button) {
    return;
  }
  uiAdditional() {
    return false;
  }
  uiGoToMain() {
    return false;
  }
  /**
   * Find all routes towards destination using BFS
   * @param {Page} destination 
   * @returns {Map<Page, Page>}
   */
  #getPageRoutes(destination) {
    let routes = new Map();
    let queue = [destination];
    routes.set(destination, null);
    while (queue.length > 0) {
      let current = queue.shift();
      Array.from(current.prevPages.values()).forEach(prev => {
        if (!routes.has(prev)) {
          queue.push(prev);
          routes.set(prev, current);
        }
      });
    }
    return routes;
  }
}

module.exports = UI;