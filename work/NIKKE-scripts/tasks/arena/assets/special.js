const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.SEASON_OVER = new TextButton('赛季结束', /(敬请|期待)/, [0, 0.3, 1, 0.7]);
buttons.TEAM_UP_PAGE = new TextButton('编队页面', /编队页面/, /[攻击防御自动下一步]{2,}/);
buttons.ATK = new TextButton('ATK', /ATK/, [0, 0, 1, 0.6]);
buttons.SPEICAL_ARENA_TITLE = new TextButton('特殊竞技场标题', /^特.*技场/, rect => {
  let b = buttons.ATK.button;
  return b && rect.bottom < b.top && rect.left > b.right;
});
buttons.TOUCH = new TextButton('TOUCH', /^T.UCH/, rect => {
  let b = buttons.ATK.button;
  return b && rect.bottom < b.top && rect.left > b.right;
}, 0.8, rect => {
  let b = buttons.SPEICAL_ARENA_TITLE.button;
  if (!b)
    return null;
  rect.left = b.left;
  rect.right = b.right;
  return rect;
});
buttons.CLAIM = new TextButton('领取', /[领領邻]取$/, [0.4, 0.6, 1, 1]);

module.exports = buttons;