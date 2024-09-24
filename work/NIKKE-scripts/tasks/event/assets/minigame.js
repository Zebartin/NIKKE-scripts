const { TextButton, ImageButton } = require('../../../../../common/base/button');
let buttons = {};

buttons.START = new TextButton('开始游戏', /Start/i, [0.5, 0.5, 1, 1]);
buttons.IN_GAME_CHECK = new TextButton('游戏中', /(BE.T|.C.RE)/, [0, 0, 1, 0.3]);
buttons.LEFT = new ImageButton('左', './assets/minigame/left.jpg', [0, 0.5, 0.5, 1], 0.7);
buttons.RIGHT = new ImageButton('右', './assets/minigame/right.jpg', [0.5, 0.5, 1, 1], 0.7);
buttons.CAKE_1 = new ImageButton('蛋糕1', './assets/minigame/cake_1.jpg', [0, 0.4, 1, 0.9]);
buttons.CAKE_2 = new ImageButton('蛋糕2', './assets/minigame/cake_2.jpg', [0, 0.4, 1, 0.9]);
buttons.BOMB_1 = new ImageButton('炸弹1', './assets/minigame/bomb_1.jpg', [0, 0.4, 1, 0.9]);
buttons.BOMB_2 = new ImageButton('炸弹2', './assets/minigame/bomb_2.jpg', [0, 0.4, 1, 0.9]);
buttons.CAKE_SP = new ImageButton('特殊蛋糕', './assets/minigame/cake_sp.jpg', [0, 0.4, 1, 0.9]);

module.exports = buttons;