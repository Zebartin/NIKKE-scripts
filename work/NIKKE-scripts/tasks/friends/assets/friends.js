const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.SEND = new TextButton('赠送', /^[^每日发上限]{0,5}赠送$/, [0.3, 0.6, 1, 1]);
buttons.FRIEND_LIST_UPPERBOUND = new TextButton('好友列表上界位置', /(之间|可以|点数)/, [0, 0.1, 0.6, 0.4]);
buttons.SOME_FRIEND = new TextButton('某位好友', /(分钟|小时|天|登入$)/, (rect) => {
  let ub = buttons.FRIEND_LIST_UPPERBOUND.button;
  let lb = buttons.SEND.button;
  return !!ub && !!lb && rect.top > ub.bottom && rect.bottom < lb.top;
});
buttons.FRIEND_DETAIL = new TextButton('好友详情',/(日期|代表|进度)/, [0, 0.2, 0.5, 0.8]);
module.exports = buttons;