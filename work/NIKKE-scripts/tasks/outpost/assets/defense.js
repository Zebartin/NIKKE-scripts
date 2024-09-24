const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.WIPE_OUT = new TextButton('一举歼灭', /灭$/, [0, 0.5, 0.5, 1]);
buttons.DO_WIPE_OUT = new TextButton('进行歼灭', /^进行.+灭$/, [0, 0.5, 1, 1]);
buttons.WIPE_OUT_GUIDE = new TextButton('歼灭说明', /(立即|首次|分钟)/, [0, 0.3, 1, 0.7]);
buttons.COST_GEM = new TextButton('消耗珠宝', /(优先|珠宝|确认)/, [0, 0, 1, 0.7]);

buttons.CLAIM_REWARD = new TextButton('获得奖励', /奖励/, [0.5, 0.6, 1, 1]);

module.exports = buttons;