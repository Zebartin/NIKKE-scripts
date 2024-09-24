const { saveImage } = require('../base/utils');
const logger = require('../base/logger');
const Timer = require('../base/timer');
const Config = require('../config/config');
/**
 * Screenshot class
 */
class Screenshot {
  #maxCostOcr;
  #requested;
  #screenshotInterval;

  preprocessOptions;
  #oldImage;
  #oldOcrResult;

  /**
   * @param {Config} config - The configuration object.
   */
  constructor(config) {
    this.config = config
    this.image = null;
    this.ocrResult = null;
    this.#maxCostOcr = 0;
    this.#requested = false;
    this.#screenshotInterval = new Timer(this.config.General_ScreenshotInterval);
    this.preprocessOptions = null;
    this.#oldImage = null;
    this.#oldOcrResult = null;
  }
  getOrientation() {
    let orientation = context.getResources().getConfiguration().orientation;
    if (orientation == android.content.res.Configuration.ORIENTATION_PORTRAIT)
      return 'portrait';
    else
      return 'landscape';
  }
  requestScreenCapture() {
    auto.waitFor();
    if (this.#requested) {
      return;
    }
    //安卓版本高于Android 9
    if (device.sdkInt > 28) {
      //等待截屏权限申请并同意
      threads.start(function () {
        let t = packageName('com.android.systemui').textMatches(/(允许|立即开始)/).findOne(10000);
        if (t != null)
          t.click();
        else
          logger.error('No button with text "允许"/"立即开始" shows up');
      });
    }
    // 检查屏幕方向
    let orientation = this.getOrientation();
    let isLandscape = orientation == 'landscape';
    let isTablet = (device.width > device.height);    // 平板横边 > 竖边
    logger.debug(`Request screen capture: ${isLandscape ? 'landscape' : 'portrait'}, device type: ${isTablet ? 'tablet' : 'phone'}`);
    if (!requestScreenCapture((isLandscape ^ isTablet) == 1)) {
      logger.error("Failed to request screen capture permission");
      exit();
    }
    this.#requested = true;
    sleep(1000);
  }
  stopScreenshot() {
    if (images.stopScreenCapturer) {
      images.stopScreenCapturer();
    }
  }
  get width() {
    if (this.image === null) {
      this.screenshot(false);
    }
    return this.image.width;
  }
  get height() {
    if (this.image === null) {
      this.screenshot(false);
    }
    return this.image.height;
  }
  get safeInterval() {
    return Math.max(1500, this.#maxCostOcr) * 1.5;
  }
  ocr(image) {
    if (!image)
      image = this.image;
    return gmlkit.ocr(image, 'zh');
  }
  screenshot(ocr = true) {
    this.requestScreenCapture();
    this.#screenshotInterval.wait();
    this.#screenshotInterval.reset();
    let start = Date.now();
    this.image = images.captureScreen();
    let costScreenshot = Date.now() - start;
    let costOcr = null;
    if (ocr) {
      this.ocrResult = this.ocr();
      costOcr = Date.now() - start - costScreenshot;
      this.#maxCostOcr = Math.max(this.#maxCostOcr, costOcr);
    }
    return this.image;
  }
  setScreenshotInnterval(interval) {
    interval = interval || this.config.General_ScreenshotInterval;
    let oldInterval = this.#screenshotInterval.limit;
    if (interval != oldInterval) {
      logger.debug(`Set screenshot interval: ${(oldInterval / 1000).toFixed(1)}s -> ${(interval / 1000).toFixed(1)}s`);
      this.#screenshotInterval.limit = interval;
    }
  }
  /** 
   * @param {Image} image
   * @param {number} scale
   * @param {boolean} grayscale
  */
  setOcrPreprocess(image = null, scale = 1, grayscale = false) {
    let original = image;
    let products = [];
    if (original === null) {
      if (this.#oldImage != null) {
        original = this.#oldImage;
      } else {
        if (this.image === null) {
          this.screenshot(false);
        }
        original = this.image;
      }
    }
    products.push(original);
    if (grayscale) {
      products.push(images.grayscale(products[products.length - 1]));
    }
    if (scale > 1) {
      products.push(images.scale(products[products.length - 1], scale, scale, 'CUBIC'));
    }
    if (products.length <= 1 && image === null) {
      return;
    }
    this.preprocessOptions = { scale: scale };
    this.#oldImage = this.image;
    this.#oldOcrResult = this.ocrResult;
    for (let i = 1; i < products.length - 1; ++i) {
      products[i].recycle();
    }
    this.image = products[products.length - 1];
    this.ocrResult = this.ocr();
  }
  resetOcr() {
    if (this.preprocessOptions) {
      if (this.preprocessOptions.scale > 1)
        this.image && this.image.recycle();
      this.image = this.#oldImage;
      this.ocrResult = this.#oldOcrResult;
    }
    this.preprocessOptions = null;
    this.#oldImage = null;
    this.#oldOcrResult = null;
  }
  imageSave(image, file) {
    if (!image)
      image = this.image;
    file = saveImage(image, file);
    logger.debug(`Screenshot saved: ${file}`);
  }
  logOcrResult() {
    if (this.ocrResult == null) {
      logger.debug('No ocr result found');
      return;
    }
    logger.debug('Current ocr result:');
    let res = this.ocrResult.toArray(3);
    for (let i = 0; i < res.length; ++i) {
      let x = res[i];
      logger.debug(`${x.bounds}\t"${x.text}"`);
    }
  }
}

module.exports = Screenshot;
