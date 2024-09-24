const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.CLAIM_REWARD = new TextButton('点击领取奖励', /(点击[领領邻]取奖励)/, [0, 0.5, 1, 1], 0.8, (rect, image) => {
  rect.left = 0;
  rect.right = image.width;
  rect.bottom = image.height;
  return rect;
});
buttons.CONFIRM = new TextButton('确认', /[確确][認认]$/, [0, 0.4, 1, 1]);
buttons.DONT_SHOW_UP = new TextButton('不再显示', /.{0,4}不再显/, [0, 0.4, 1, 1]);
buttons.ANNOUCEMENT = new TextButton('公告', /系统公告/, [0.4, 0, 1, 0.6]);
buttons.LOGIN_EVENT_CHECK = new TextButton('活动签到', /活动.*登.*可/, [0, 0.1, 1, 0.4]);
buttons.LOGIN_EVENT_CLAIM = new TextButton('领取签到奖励', /[^已巳己]?[领領邻]取/, [0.5, 0.5, 1, 1]);
buttons.REVIEW_NOTIFICATION = new TextButton('意见反馈', /操控|感觉怎么|意见/, [0, 0.4, 1, 0.8]);
buttons.REVIEW_CLOSE = new TextButton('关闭', /关闭$/, [0, 0.4, 0.5, 0.8]);
buttons.SALE_CLOSE = new TextButton('点击关闭画面', /点击关闭/, [0, 0.5, 1, 1], 0.8, (rect, image) => {
  rect.left = 0;
  rect.right = image.width;
  rect.bottom = image.height;
  return rect;
});
buttons.SALE_CLOSE_POPUP = new TextButton('限时礼包关闭通知', /(移至|限定|过期)/, [0, 0.3, 1, 0.7]);
buttons.EXIT_GAME_POPUP = new TextButton('退出游戏确认', /要结束.*吗/, [0, 0.3, 1, 0.7]);

module.exports = buttons;