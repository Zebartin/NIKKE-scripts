const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.NEED_PASSWORD = new TextButton('需要输入密码', /(密|验证)码/);
buttons.UNDER_MAINTENANCE = new TextButton('维护中', /(正在维护中|稍后再试)/, [0, 0.3, 1, 0.7]);
buttons.DOWNLOADING = new TextButton('正在下载', /正在下载/, [0, 0.6, 1, 1]);
buttons.TOUCH_TO_CONTINUE = new TextButton('点击继续', /(登出|T.UCH|C.NT.NUE)/, [0, 0, 1, 1], 0.8, (rect, image) => {
  let w = image.width, h = image.height;
  rect.left = w * 0.2;
  rect.right = w * 0.8;
  rect.top = 0;
  rect.bottom = h;
  return rect;
});

module.exports = buttons;