const { TextButton } = require('../../../../common/base/button');
const { getNextServerUpdate } = require('../../../../common/config/utils');
const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const { pageRecyclingShop } = require('../base/page');
const { GEM, GROWTH_SET, BOND_ITEM_GENERAL, BOND_ITEM_ELYSION, BOND_ITEM_MISSILIS, BOND_ITEM_TETRA, BOND_ITEM_PILGRIM, BOND_ITEM_ABNORMAL, CORE_DUST_CASE, CREDIT_CASE, BATTLE_DATA_SET_CASE, CREDIT, REFRESH_TIME } = require('./assets/recycling');
const { REFRESH } = require('./assets/ui');
const ShopUI = require('./ui');

class RecyclingShop extends ShopUI {
  run() {
    this.ensureRefresh(pageRecyclingShop);
    this.#buyItems();
    this.config.taskDelay(false, this.#getRefreshTime());
    // this.config.taskDelay(false, null, 0.3);
  }
  #buyItems() {
    let allItemButtons = {};
    for (let button of [
      GEM, GROWTH_SET, BOND_ITEM_GENERAL,
      BOND_ITEM_ELYSION, BOND_ITEM_MISSILIS,
      BOND_ITEM_TETRA, BOND_ITEM_PILGRIM,
      BOND_ITEM_ABNORMAL, CORE_DUST_CASE,
      CREDIT_CASE, BATTLE_DATA_SET_CASE, CREDIT
    ]) {
      allItemButtons[button.name] = button;
    }
    const regAll = new RegExp(`(${Object.values(allItemButtons).map(x => x.matchedText.source).join('|')})`);
    const regWanted = new RegExp(`(${this.config.RecyclingShop_ShoppingList.map(x => allItemButtons[x].matchedText.source).join('|')})`);
    const buttonAll = new TextButton('废铁商店商品', regAll, GEM.search, 0.5);
    let dragArea = null;
    let confirmTimer = new Timer(1000, 1).start();
    let loadTimer = new Timer(800, 1);
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (loadTimer.reached()) {
        let items = buttonAll.matchMultiText(this.device.image, this.device.ocrResult);
        logger.debug(`当前页面商品：${items.map(e => e.text).join(', ')}`)
        for (let item of items) {
          if (regWanted.test(item.text))
            this.buyItem(item, true, false);
        }
        if (CREDIT.matchedText.test(items[items.length - 1].text)) {
          if (confirmTimer.reached())
            break;
        }
        if (dragArea === null) {
          let l = items[0].button.left;
          let t = REFRESH.button.bottom;
          let r = items.reduce((x, y) => x.button.right > y.button.right ? x : y, items[0]).button.right;
          dragArea = new android.graphics.Rect(l, t, r, 0);
        }
        dragArea.bottom = (items[items.length - 1].button.bottom + items[0].button.bottom) / 2;
        this.device.dragVertical(dragArea, 'up');
        loadTimer.reset();
      }
    }
  }
  #getRefreshTime(skipFirstScreenshot = true) {
    let timeout = new Timer(5000, 3).start();
    let remainingDay = 0;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (timeout.reached()) {
        logger.warning('获取商店更新时间超时');
        break;
      }
      if (this.appear(REFRESH_TIME)) {
        let matched = REFRESH_TIME.text.match(REFRESH_TIME.matchedText);
        if (matched[2])
          remainingDay = parseInt(matched[2]);
        break;
      }
    }
    let future = getNextServerUpdate(this.config.General_ServerUpdate);
    future.setDate(future.getDate() + remainingDay);
    return future;
  }
}

module.exports = RecyclingShop;