const { TextButton, ImageButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.CASH_SHOP_ENTRANCE = new TextButton('付费商店入口', /付/, [0, 0.3, 0.5, 1]);
buttons.CASH_SHOP_CANNOT_ENTER = new TextButton('无法进入', /(前往大厅|网络异常)/,[0, 0.2, 1, 0.8]);
buttons.CASH_SHOP_RETRY_ENTER = new TextButton('重新再试', /新再/, [0.4, 0.3, 1, 0.7]);
buttons.CASH_SHOP_INDEX_TITLE = new TextButton('标题', /([仅在指定的销售期间]{3,}|[从同时出现的礼包中]{5,}|普[通逼]礼|[不同刷新各种]{3,})/, [0, 0, 1, 0.5]);
buttons.GIFT_ICON = new ImageButton('礼包图标', './assets/images/cashShop.jpg');
let giftSearch = (rect, image) => {
  let gb = buttons.GIFT_ICON.button;
  if (!!gb)
    return rect.top >= gb.bottom && rect.bottom < gb.bottom + gb.height() * 3;
  let tb = buttons.CASH_SHOP_INDEX_TITLE.button;
  return !!tb && rect.top >= tb.bottom && rect.bottom < image.height * 0.6;
}
buttons.GIFT_TAB_DAILY = new TextButton('每日', /日$/, giftSearch);
buttons.GIFT_TAB_WEEKLY = new TextButton('每周', /周$/, giftSearch);
buttons.GIFT_TAB_MONTHLY = new TextButton('每月', /月$/, giftSearch);
buttons.GIFT_DAILY = new TextButton('每日免费礼包', /日[免兔]/, [0, 0.2, 0.5, 0.6]);
buttons.GIFT_WEEKLY = new TextButton('每周免费礼包', /周[免兔]/, [0, 0.2, 0.5, 0.6]);
buttons.GIFT_MONTHLY = new TextButton('每月免费礼包', /月[免兔]/, [0, 0.2, 0.5, 0.6]);

module.exports = buttons;