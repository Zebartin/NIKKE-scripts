const { areaOffset } = require('../../../../../common/base/utils');
const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.MANUFACTURER_TOWER_OPEN = new TextButton('开放中企业塔', /每日/, [0, 0.4, 1, 1]);
buttons.MANUFACTURER_TOWER_CLOSE = new TextButton('未开放企业塔', /目前/, [0, 0.4, 1, 1]);
buttons.TOWER_NAME = new TextButton('企业塔名称', /之塔$/, [0, 0.6, 1, 1]);
buttons.TOWER_LIMIT = new TextButton('通关次数', /[余关]次[^\d]+([0-3])\/3/, [0, 0.6, 1, 1]);
buttons.TOWER_STAGE = new TextButton('关卡入口', /TAGE/, [0, 0.2, 0.5, 0.7], 0.8, (rect, image) => {
  let diffX = image.width / 2 - rect.centerX();
  return areaOffset(rect, [diffX, 0]);
});
module.exports = buttons;