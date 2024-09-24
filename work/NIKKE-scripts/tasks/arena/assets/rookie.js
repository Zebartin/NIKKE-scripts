const { TextButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.SEASON_OVER = new TextButton('赛季结束', /(敬请|期待)/, [0, 0.3, 1, 0.7]);
buttons.FREE_ENTER = new TextButton('免费入场', /免/, [0.5, 0.3, 1, 1]);
buttons.ENTER_FIGHT_PREPARE = new TextButton('准备战斗', /战斗$/, [0.5, 0.3, 1, 1]);
buttons.ENTER_FIGHT_PREPARE_CHECK = new TextButton('变更编队', /(变更|编队)/, [0, 0.5, 0.5, 1]);
buttons.ENTER_FIGHT = new TextButton('进入战斗', /战斗$/, [0.5, 0.5, 1, 1]);
buttons.FIGHT_OVER = new TextButton('战斗结束', /(RANK|REW|点击进行)/, [0, 0.5, 1, 1], 0.8, (rect, image) => {
  let w = image.width, h = image.height;
  rect.left = 0;
  rect.right = w;
  rect.top = 0;
  rect.bottom = h * 0.3;
  return rect;
});
buttons.FIGHT_WIN = new TextButton('胜利', /W[^A]N?/, [0, 0, 1, 0.5]);
buttons.FIGHT_LOSE = new TextButton('失败', /L.SE/, [0, 0, 1, 0.5]);

module.exports = buttons;