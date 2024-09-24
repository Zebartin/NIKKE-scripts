const { TextButton } = require('../../../../../common/base/button');
const { REFRESH } = require('./ui');
let buttons = {};

let searchFunc = function (rect) {
  let b = REFRESH.button;
  return !!b && rect.top > b.bottom;
};
buttons.GEM = new TextButton('珠宝', /珠宝/, searchFunc);
buttons.GROWTH_SET = new TextButton('成长套组', /成长套组/, searchFunc);
buttons.BOND_ITEM_GENERAL = new TextButton('好感券-通用', /[通逼]/, searchFunc);
buttons.BOND_ITEM_ELYSION = new TextButton('好感券-极乐净土', /极/, searchFunc);
buttons.BOND_ITEM_MISSILIS = new TextButton('好感券-米西利斯', /米/, searchFunc);
buttons.BOND_ITEM_TETRA = new TextButton('好感券-泰特拉', /特/, searchFunc);
buttons.BOND_ITEM_PILGRIM = new TextButton('好感券-朝圣者', /(朝|补给|交换)/, searchFunc);
buttons.BOND_ITEM_ABNORMAL = new TextButton('好感券-反常', /反/, searchFunc);
buttons.CORE_DUST_CASE = new TextButton('芯尘盒', /尘[盒會]$/, searchFunc);
buttons.CREDIT_CASE = new TextButton('信用点盒', /点[盒會]$/, searchFunc);
buttons.BATTLE_DATA_SET_CASE = new TextButton('战斗数据辑盒', /[辑帽][盒會]$/, searchFunc);
buttons.CREDIT = new TextButton('信用点', /点$/, searchFunc);
buttons.REFRESH_TIME = new TextButton('更新时间', /余(([1-7])天)?\d+小/, rect => {
  let b = REFRESH.button;
  return !!b && rect.left >= b.left && rect.top <= b.bottom && rect.bottom >= b.top;
});

module.exports = buttons;