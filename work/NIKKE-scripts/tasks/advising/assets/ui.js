const { TextButton } = require('../../../../../common/base/button');
const { ADVISING_ORDER } = require('../../base/assets/page');
let buttons = {};

buttons.ADVISING_ALL = new TextButton('ALL', /ALL/, [0, 0, 0.4, 0.4]);
buttons.ADVISING_LIMIT = new TextButton('咨询次数', /([o\d]{1,2})\/\d/i, rect => {
  let b = buttons.ADVISING_ALL.button;
  let ob = ADVISING_ORDER.button;
  return !!b && !!ob && rect.bottom > b.bottom && rect.top < ob.bottom;
});
buttons.ADVISING_ENTRY = new TextButton('咨询入口', /(Attr|R.NK)/, (rect, image) => {
  let b = buttons.ADVISING_LIMIT.button;
  return !!b && rect.bottom > b.bottom && rect.right <= image.width / 2;
});
buttons.VIEW_EPISODE = new TextButton('查看花絮', /看花/, [0.5, 0.4, 1, 0.9]);
buttons.NEXT_EPISODE = new TextButton('下一花絮所需好感度排名', /(下|所需|排名)/, rect => {
  let b = buttons.VIEW_EPISODE.button;
  return !!b && rect.top > b.bottom;
});
buttons.RANK = new TextButton('RANK', /RANK/, rect => {
  const b = buttons.VIEW_EPISODE.button;
  return !!b && rect.bottom < b.top && rect.right < b.left;
});
buttons.RANK_MAX = new TextButton('MAX', /M.X/i, rect => {
  let ub = buttons.VIEW_EPISODE.button;
  let lb = buttons.NEXT_EPISODE.button;
  return !!ub && !!lb && rect.top > ub.top && rect.left > ub.left && rect.bottom < lb.bottom;
})
buttons.START_ADVISE = new TextButton('咨询', /咨询$/, [0.5, 0.5, 1, 1]);
buttons.CONFIRM_ADVISE = new TextButton('确认咨询', /[確确][認认]$/, [0.4, 0.3, 1, 0.7]);
buttons.CANCEL_ADVISE = new TextButton('取消咨询', /取[消清]/, [0, 0.3, 0.6, 0.7]);
buttons.MAX_WARNING = new TextButton('已达上限', /(达上限|无法|继续)/, rect => {
  let b = buttons.CONFIRM_ADVISE;
  return !!b && rect.bottom < b.top;
});
buttons.RANK_INCREASE = new TextButton('RANK INCREASE', /(.NCREASE|点击进行|体力|攻击|防御|解锁)/);

module.exports = buttons;