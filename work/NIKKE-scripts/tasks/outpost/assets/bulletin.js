const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.NO_MISSION = new TextButton('没有任务', /目前/, [0, 0, 1, 1]);
buttons.SOME_MISSION = new TextButton('派遣目录', /(完成|时间)/, [0, 0, 1, 1]);
buttons.CLAIM_ALL = new TextButton('全部领取', /全[都部][领領邻]/, [0.5, 0.5, 1, 1]);
buttons.DISPATH_ALL = new TextButton('全部派遣', /全[都部]派/, [0.1, 0.5, 1, 1]);
buttons.DISPATCH_CANCEL = new TextButton('取消派遣', /取[消清]/, [0, 0.5, 0.5, 1]);
buttons.DISPATCH_CONFIRM = new TextButton('确认派遣', /派/, (rect) => {
  let b = buttons.DISPATCH_CANCEL.button;
  return !!b && rect.bottom > b.top;
});

module.exports = buttons;