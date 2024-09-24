const { TextButton } = require('../../../../../common/base/button');
const { areaPad, limitIn } = require('../../../../../common/base/utils');
let buttons = {};

buttons.BUY_CONFIRM = new TextButton('购买', /购买$/, [0.3, 0.5, 1, 1]);
buttons.BUY_CANCEL = new TextButton('取消', /取消$/, [0, 0.5, 0.7, 1]);
buttons.BUY_MAX = new TextButton('MAX', /M.X/i, (rect, image) => {
  let b = buttons.BUY_CONFIRM.button;
  return !!b && rect.top >= image.height * 0.4 &&
    rect.left >= b.left && rect.bottom < b.top;
}, 0.3);
buttons.COST_GEM = new TextButton('消耗珠宝', /(珠宝|招募|优先|扣除)/, (rect, image) => {
  let b = buttons.BUY_CONFIRM.button;
  let mb = buttons.BUY_MAX.button;
  let upperBound = !!mb ? mb.bottom : image.height * 0.4;
  return !!b && rect.bottom < b.top && rect.top >= upperBound;
});
buttons.INSUFFICIENT_FUND = new TextButton('资金不足', /不足.?$/, [0, 0.3, 1, 0.7]);
buttons.REFRESH = new TextButton('刷新商店', /(距离|还有)/, [0, 0.2, 1, 0.8]);
buttons.REFRESH_CONFIRM = new TextButton('确认刷新', /^确认$/, [0.4, 0.2, 1, 0.8]);
buttons.REFRESH_CANCEL = new TextButton('取消刷新', /^取消$/, [0, 0.2, 0.6, 0.8]);
buttons.REFRESH_COST = new TextButton('刷新消耗', /(消耗|[殊珠][宝室])/, (rect, image) => {
  let b = buttons.REFRESH_CONFIRM.button;
  return !!b && rect.bottom < b.top && rect.top > image.height * 0.2;
}, 1, (rect, image) => {
  let w = rect.width();
  let h = rect.height();
  let ret = areaPad(rect, [0, -h, -w * 1.5, -h]);
  ret.right = limitIn(ret.right, 0, image.width);
  return ret;
});

module.exports = buttons;