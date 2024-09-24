const Timer = require('../../../../common/base/timer');
const { FREE_ITEM, CORE_DUST, BOND_ITEM, CODE_MANUAL } = require('./assets/shop');
const { pageGeneralShop, pageArenaShop } = require("../base/page");
const ShopUI = require('./ui');

class Shop extends ShopUI {
  run() {
    let shoppingList = [];
    if (this.config.GeneralShop_BuyCoreDust)
      shoppingList.push(CORE_DUST);
    if (this.config.GeneralShop_BuyBondItem)
      shoppingList.push(BOND_ITEM);
    this.ensureRefresh(pageGeneralShop);
    this.#buyGeneralItems(shoppingList);
    if (this.refreshShop()) {
      this.#waitUntilRefreshed();
      this.#buyGeneralItems(shoppingList);
    }
    this.ensureRefresh(pageArenaShop);
    this.#buyCodeManuals();
    this.config.taskDelay(true);
  }
  #waitUntilRefreshed(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(FREE_ITEM))
        return;
    }
  }
  #buyGeneralItems(shoppingList) {
    if (this.appear(FREE_ITEM)) {
      FREE_ITEM.text = FREE_ITEM.name;
      this.buyItem(FREE_ITEM, false, false);
    }
    for (let button of shoppingList) {
      let items = button.matchMultiText(this.device.image, this.device.ocrResult);
      for (let item of items)
        this.buyItem(item, false, true);
    }
    this.device.clickRecordClear();
  }
  #buyCodeManuals(skipFirstScreenshot = true) {
    let checkInterval = new Timer(1000, 2);
    let cnt = this.config.ArenaShop_ManualCount;
    let items = [];
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (checkInterval.reachedAndReset()) {
        items = CODE_MANUAL.matchMultiText(this.device.image, this.device.ocrResult);
        if (items.length == 4)
          break;
      }
    }
    for (let i = 0; i < cnt; ++i)
      this.buyItem(items[i], false, false);
  }
}

module.exports = Shop;