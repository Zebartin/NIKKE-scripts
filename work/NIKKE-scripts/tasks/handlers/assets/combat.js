const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.ENTER_COMBAT = new TextButton('进入战斗', /入战/, [0.4, 0.7, 1, 1]);
buttons.FAST_COMBAT = new TextButton('快速战斗', /快[連德逮遠速]战/, [0.4, 0.7, 1, 1]);
buttons.COMBAT_AUTO = new TextButton('自动爆裂', /AUT/, [0, 0, 0.5, 0.3]);
buttons.COMBAT_REWARD = new TextButton('战斗奖励', /REWARD/, [0, 0.4, 0.6, 1]);
buttons.COMBAT_FAILED = new TextButton('战斗失败', /FA.L/, [0, 0, 1, 0.6]);
buttons.CLICK_TO_NEXT = new TextButton('点击进行下一步', /点击.*步/, [0, 0.7, 1, 1]);
buttons.CLICK_ANYWHERE = new TextButton('随机位置', null, [0, 0, 1, 0.7], 0.8);
buttons.NEXT_COMBAT = new TextButton('下一关卡', /^[^重新开始]{0,3}下.关/);
buttons.BACK_FROM_FAILURE = new TextButton('失败返回', /返回/, [0, 0.8, 0.5, 1]);

module.exports = buttons;