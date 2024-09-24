const { getNextServerUpdate } = require("../../../../common/config/utils");
const { areaPad, limitIn } = require("../../../../common/base/utils");
const Timer = require("../../../../common/base/timer");
const logger = require("../../../../common/base/logger");
const { pageMain } = require("../base/page");
const NikkeUI = require("../base/ui");
const { CASH_SHOP_ENTRANCE, CASH_SHOP_INDEX_TITLE, GIFT_ICON, GIFT_TAB_DAILY, GIFT_DAILY, GIFT_TAB_WEEKLY, GIFT_WEEKLY, GIFT_TAB_MONTHLY, GIFT_MONTHLY, CASH_SHOP_CANNOT_ENTER, CASH_SHOP_RETRY_ENTER } = require("./assets/cash");

class CashShop extends NikkeUI {
  run() {
    this.daily();
    this.weekly();
    this.monthly();
  }
  daily() {
    if (!this.ensureFreeGift())
      return;
    this.claimFreeGift(GIFT_TAB_DAILY, GIFT_DAILY);
    this.config.taskDelay(true);
  }
  weekly() {
    if (!this.ensureFreeGift())
      return;
    this.claimFreeGift(GIFT_TAB_WEEKLY, GIFT_WEEKLY);
    let future = getNextServerUpdate(this.config.General_ServerUpdate);
    let diffDays = (9 - future.getDay()) % 7;
    future.setDate(future.getDate() + diffDays);
    this.config.taskDelay(false, future);
  }
  monthly() {
    if (!this.ensureFreeGift())
      return;
    this.claimFreeGift(GIFT_TAB_MONTHLY, GIFT_MONTHLY);
    let future = getNextServerUpdate(this.config.General_ServerUpdate);
    future.setMonth(future.getMonth() + 1);
    future.setDate(1);
    this.config.taskDelay(false, future);
  }
  ensureFreeGift(skipFirstScreenshot = true) {
    if (!this.appear(CASH_SHOP_INDEX_TITLE))
      if (!this.#enterCashShop(skipFirstScreenshot))
        return false;
    let top = CASH_SHOP_INDEX_TITLE.button.bottom;
    GIFT_ICON.setRegion(new android.graphics.Rect(
      0, top, this.device.width * 0.5,
      top + GIFT_ICON.template.getHeight() * 5
    ));
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(GIFT_TAB_DAILY))
        break;
      if (this.appearThenClick(GIFT_ICON, 1000, 2))
        continue;
      if (this.handleReview())
        continue;
    }
    return true;
  }
  claimFreeGift(tabButton, giftButton, skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(giftButton))
        break;
      if (this.handleReview())
        continue;
      if (this.appear(GIFT_TAB_DAILY, 1000, 2)) {
        if (this.appear(tabButton)) {
          this.device.click(tabButton);
        } else {
          let w = GIFT_TAB_DAILY.button.width();
          let area = areaPad(GIFT_TAB_DAILY.button, [-w, 0]);
          area.left = limitIn(area.left, 0, this.device.width);
          area.right = limitIn(area.right, 0, this.device.width);
          this.device.swipe(area, 'left');
        }
        continue;
      }
    }
    skipFirstScreenshot = true;
    let confirmTimer = new Timer(5000, 2);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (confirmTimer.reached() && this.appear(giftButton, 1000)) {
        if (this.imageColorCount(giftButton, '#212121', 221, 2000))
          break;
        if (this.imageColorCount(giftButton, '#ffffff', 221, 1000)) {
          this.device.click(giftButton);
          confirmTimer.reset();
          continue;
        }
      }
      if (this.handleReward()) {
        confirmTimer.clear();
        continue;
      }
      if (this.handleReview())
        continue;
    }
  }
  #enterCashShop() {
    let skipFirstScreenshot = true;
    this.uiEnsure(pageMain);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(CASH_SHOP_INDEX_TITLE))
        return true;
      if (this.appear(CASH_SHOP_CANNOT_ENTER)) {
        logger.warning('无法进入付费商店');
        break;
      }
      if (this.appearThenClick(CASH_SHOP_ENTRANCE, 1000, 2))
        continue;
      if (this.uiAdditional())
        continue;
    }
    let googlePlayStarted = false;
    try {
      this.device.appStart('Google Play 商店');
      googlePlayStarted = true;
    } catch (error) { }
    if (googlePlayStarted) {
      this.device.appStart('NIKKE');
      let timeout = new Timer(30000, 5).start();
      while (true) {
        this.device.screenshot();
        if (this.appear(CASH_SHOP_INDEX_TITLE))
          return true;
        if (timeout.reached())
          break;
        if (this.appearThenClick(CASH_SHOP_RETRY_ENTER, 2000, 2))
          continue;
        if (this.appearThenClick(CASH_SHOP_ENTRANCE, 5000, 2))
          continue;
        this.device.stuckRecordClear();
      }
    }
    while (true) {
      this.device.back();
      this.device.screenshot();
      if (this.uiPageAppear(pageMain))
        break;
    }
    for (let task of ["CashShopDaily", "CashShopWeekly", "CashShopMonthly"]) {
      const nextRun = this.config.getTaskNextRun(task);
      const newNextRun = new Date(Date.now() + 1 * 60 * 1000);
      if (nextRun < newNextRun)
        this.config.taskDelay(false, newNextRun, null, task);
    }
    return false;
  }
}

module.exports = CashShop;