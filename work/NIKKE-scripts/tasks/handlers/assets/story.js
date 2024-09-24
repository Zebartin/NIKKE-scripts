const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.STORY_CHECK = new TextButton('剧情进行中', /(AUT[O0]|L[O0]G|CANCEL|SK.P)/, [0.5, 0, 1, 0.3]);
buttons.SKIP = new TextButton('SKIP', x => {
  return x.match(/[LAUTOG]/) == null && x.match(/SK.P/) != null
}, [0.5, 0, 1, 0.3]);
buttons.CANCEL = new TextButton('CANCEL', /NCE/, [0.5, 0, 1, 0.3], 1, rect => {
  if (rect.width() >= 200)
    rect.left = rect.right - 200;
  return rect;
});
buttons.CLICK_ANYWHERE = new TextButton('任意位置', null, [0, 0, 1, 0.6], 0.6);

module.exports = buttons;