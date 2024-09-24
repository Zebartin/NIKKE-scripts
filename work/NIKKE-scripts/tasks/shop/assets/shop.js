const { TextButton } = require('../../../../../common/base/button');
const { REFRESH } = require('./ui');
let buttons = {};

let searchFunc = function(rect) {
  let b = REFRESH.button;
  return !!b && rect.top > b.bottom;
};
buttons.FREE_ITEM = new TextButton('免费商品', /100%/, searchFunc);
buttons.CORE_DUST = new TextButton('芯尘盒', /^芯尘盒$/, searchFunc);
buttons.BOND_ITEM = new TextButton('好感券', /(券$|米.*卡$)/, searchFunc);
buttons.CODE_MANUAL = new TextButton('代码手册', text => {
  return text.match(/(代码手册|选择|宝箱|([NSEPHMRIDZAUT1]\.?){2,})/) != null &&
    text.match(/(s[odqu0]l[odqu0]|[odqu0]ut)/i) == null
}, searchFunc);

module.exports = buttons;