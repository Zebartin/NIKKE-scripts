const Timer = require("../../../../common/base/timer");
const logger = require("../../../../common/base/logger");
const { areaPad, limitIn } = require("../../../../common/base/utils");
const { TextButton } = require("../../../../common/base/button");
const { BUY_CANCEL, BUY_CONFIRM, BUY_MAX, REFRESH, REFRESH_CANCEL, REFRESH_CONFIRM, REFRESH_COST, COST_GEM, INSUFFICIENT_FUND } = require("./assets/ui");
const NikkeUI = require("../base/ui");

class ShopUI extends NikkeUI {
  ensureRefresh(page) {
    this.uiEnsure(page);
    let loadTimer = new Timer(1000, 1).start();
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (loadTimer.reached() && this.appear(REFRESH))
        break;
    }
  }
  /**
   * 
   * @param {TextButton} item 
   * @param {boolean} checkMax 
   * @param {boolean} checkCostGem 
   */
  buyItem(item, checkMax = false, checkCostGem = true, skipFirstScreenshot = true) {
    logger.debug(`购买"${item.text}"`);
    let checked = false;
    let clickInterval = new Timer(1000, 2);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(BUY_CANCEL) && this.appear(BUY_CONFIRM) && this.appear(BUY_MAX))
        break;
      if (!checked) {
        // Item is sold out
        if (!this.imageColorCount(item, '#ffffff', 221, 300)) {
          logger.debug(`"${item.text}"已售`);
          if (item.text == '免费商品') {
            let img = this.imageCrop(this.device.image, item.button);
            this.device.imageSave(img);
            img.recycle();
          }
          return false;
        }
        checked = true;
      }
      if (clickInterval.reachedAndReset()) {
        this.device.click(item);
        continue;
      }
    }
    skipFirstScreenshot = true;
    let canBuy = !(checkCostGem && this.appear(COST_GEM));
    canBuy && checkMax && this.ensureMax();
    let checkTimer = new Timer(2000, 2).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (checkTimer.reached() && this.appear(REFRESH))
        break;
      if (this.appear(INSUFFICIENT_FUND)) {
        logger.warning('资金不足');
        canBuy = false;
      }
      if (canBuy) {
        if (this.appearThenClick(BUY_CONFIRM, 1000, 2)) {
          checkTimer.reset();
          continue;
        }
      } else if (this.appearThenClick(BUY_CANCEL, 1000, 2)) {
        checkTimer.clear();
        continue;
      }
      if (this.handleReward()) {
        checkTimer.clear();
        continue;
      }
    }
    return canBuy;
  }
  ensureMax(skipFirstScreenshot = true) {
    let timeout = new Timer(2000, 3).start();
    let clickInterval = new Timer(1000, 2);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('点击MAX超时');
        break;
      }
      if (this.appear(BUY_CONFIRM) && this.appear(BUY_MAX)) {
        if (this.imageColorCount(BUY_MAX, '#6b6b6b', 221, 100))
          break;
        else if (clickInterval.reachedAndReset()) {
          this.device.click(BUY_MAX);
          continue;
        }
      }
    }
  }
  refreshShop(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(REFRESH_CONFIRM) && this.appear(REFRESH_CANCEL) && this.appear(REFRESH_COST))
        break;
      if (this.appearThenClick(REFRESH, 1000, 2))
        continue;
    }
    skipFirstScreenshot = true;
    let refreshed = this.#canRefreshFree();
    let clickButton = refreshed ? REFRESH_CONFIRM : REFRESH_CANCEL;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(REFRESH))
        break;
      if (this.appearThenClick(clickButton, 1000, 2))
        continue;
    }
    return refreshed;
  }
  #canRefreshFree(skipFirstScreenshot = true) {
    let timeout = new Timer(2000, 3).start();
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot(false);
      if (timeout.reached()) {
        // if ocr cannot confirm
        // 3500 if cost == 0, 4130 if cost == 100
        if (this.imageColorCount(REFRESH_COST, [74, 97, 123], 221, 2000)) {
          if (this.imageColorCount(REFRESH_COST, [74, 97, 123], 221, 3800))
            return false;
          return true;
        }
      }
      let cropped = this.imageCrop(this.device.image, REFRESH_COST.button);
      let maxScale = 4;
      for (let scale = 1; scale <= maxScale; ++scale) {
        this.device.setOcrPreprocess(cropped, scale);
        let costOcrResult = this.device.ocrResult;
        this.device.resetOcr();
        if (costOcrResult) {
          let cost = costOcrResult.text.replace(/[^\d]+/g, '');
          if (cost === "100"){
            cropped.recycle();
            return false;
          }
          else if (cost === "0"){
            cropped.recycle();
            return true;
          }
        }
      }
      cropped.recycle();
    }
  }
}

module.exports = ShopUI;