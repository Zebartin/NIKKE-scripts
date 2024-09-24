const { TextButton, ImageButton, Button } = require('../../../../../common/base/button');
let buttons = {};

let regDefense = /(DEFENSE|LV[\.\d]+|\d{1,3}%)/;
let regBulletin = /^派.*[公告栏]+$/;
let regRookie = /R[OD][OD]K.E/;
let regSpecial = /SPEC.AL/;

// special button
buttons.BACK = new Button('BACK');
buttons.HOME = new ImageButton('首页', './assets/images/home.jpg', [0, 0.8, 0.4, 1], 0.8);
// page_main
buttons.LOBBY = new TextButton('大厅', /^大厅$/, [0.2, 0.8, 0.8, 1]);
buttons.SHOP = new TextButton('商店', /^商店$/, [0, 0.5, 0.5, 1]);
buttons.OUTPOST = new TextButton('前哨基地', /基地$/, [0, 0.5, 0.5, 1], 0.5);
buttons.ARK = new TextButton('方舟', /方舟/, [0.5, 0.5, 1, 1]);
buttons.MAIN_TO_OUTPOST_DEFENSE = new TextButton('防御前哨基地入口', regDefense, [0, 0.7, 0.4, 1]);
buttons.MAIN_TO_FRIENDS = new TextButton('好友', /好友/, [0.6, 0, 1, 0.5]);
buttons.MAIN_TO_NIKKE = new TextButton('妮姬', /^妮姬$/, [0, 0.8, 0.4, 1]);
// page_team
buttons.TEAM_CHECK_0 = new TextButton('战役', /战[役後]/, [0.3, 0, 0.7, 0.4]);
buttons.TEAM_CHECK_1 = new TextButton('可查看战役编队', /可查看战[役後]/, [0.3, 0, 0.7, 0.4]);
buttons.TEAM_CHECK_2 = new TextButton('自动编队', /自动.队/, [0.5, 0.5, 1, 1]);
// page_outpost
buttons.COMMAND_CENTER = new TextButton('指挥中心', /中心$/, [0.2, 0.7, 1, 1]);
buttons.OUTPOST_TO_BULLETIN = new TextButton('派遣公告栏入口', regBulletin, [0.2, 0.8, 1, 1], 0.5, (rect) => {
  if (buttons.COMMAND_CENTER.button == null)
    return null;
  rect.top = buttons.COMMAND_CENTER.button.bottom;
  return rect;
});
buttons.OUTPOST_TO_DEFENSE = new TextButton('防御前哨基地入口', regDefense, [0.5, 0.7, 1, 1]);
// page_outpost_defense
buttons.STAGE_CLEAR = new TextButton('通关战役', /(STAGE CLEAR COUNT|5次|提升|防御等)/, [0, 0, 0.9, 0.5]);
// page_bulletin_board
buttons.BULLETIN_BOARD_CHECK = new TextButton('派遣公告栏', regBulletin, [0, 0.1, 0.5, 0.5]);
// page_friends
buttons.FRIENDS_CHECK = new TextButton('好友', /(好友目录|搜寻|赠送)/, [0, 0, 1, 1]);
// page_ark
buttons.ARK_TO_TOWER = new TextButton('无限之塔入口', /无限之塔/, [0.5, 0.2, 1, 0.5]);
buttons.ARK_TO_ARENA = new TextButton('竞技场入口', /技场/, [0.4, 0.5, 1, 1]);
buttons.ARK_TO_SIMULATION_ROOM = new TextButton('模拟室入口', /模拟室/, [0, 0.5, 0.5, 1]);
// page_arena
buttons.ROOKIE_ARENA = new TextButton('新人竞技场', regRookie, [0, 0.3, 0.5, 0.8]);
buttons.SPECIAL_ARENA = new TextButton('特殊竞技场', regSpecial, [0.5, 0.3, 1, 0.8]);
// page_rookie_arena & page_special_arena
buttons.ARENA_CHECK = new TextButton('竞技场', /(入战|更新|目录)/, [0.5, 0.3, 1, 1]);
buttons.ROOKIE_ARENA_CHECK = new TextButton('新人竞技场', regRookie, [0, 0, 1, 0.4]);
buttons.SPECIAL_ARENA_CHECK = new TextButton('特殊竞技场', regSpecial, [0, 0, 1, 0.4]);
// page_general_shop
buttons.GENERAL_SHOP_CHECK = new TextButton('普通商店', /(普[通逼]商店|可随时购买|需要的物品|可以购买|常用的物品)/);
// page_arena_shop
buttons.ARENA_SHOP_ENTRANCE = new ImageButton('竞技场商店图标', './assets/images/arenaShop.jpg', [0, 0.3, 0.4, 0.9], 1, rect => {
  rect.left += rect.width() * 0.7;
  return rect;
});
buttons.ARENA_SHOP_CHECK = new TextButton('竞技场商店', /([竟竞]技场商店|兑换券)/, [0, 0.2, 0.7, 0.7]);
// page_recycling_shop
buttons.RECYCLING_SHOP_ENTRANCE = new ImageButton('废铁商店图标', './assets/images/recyclingShop.jpg', [0, 0.3, 0.4, 0.9], 1, rect => {
  rect.left += rect.width() * 0.7;
  return rect;
});
buttons.RECYCLING_SHOP_CHECK = new TextButton('废铁商店', /(废铁|[破玻][碎码])/);
// page_tower
buttons.TOWER_CHECK = new TextButton('无限之塔', /(目前|每日|T.WER)/);
buttons.TOWER_OPEN = new TextButton('无限之塔开启', /开启/, [0.5, 0.3, 1, 0.7]);
// page_nikke
buttons.NIKKE_CHECK = new TextButton('可查看同伴妮姬', /看同伴/, [0, 0, 0.5, 0.5]);
buttons.NIKKE_TO_ADVISING = new TextButton('咨询入口', /^咨询$/, [0.3, 0, 1, 0.4]);
buttons.NIKKE_TO_LIBERATION = new TextButton('解放入口', /^解放$/, [0, 0, 0.5, 0.4]);
// page_advising
buttons.ADVISING_CHECK = new TextButton('可以管理同伴妮姬的好感度', /可以管理.*好感/, [0, 0, 1, 0.5]);
buttons.ADVISING_ORDER = new TextButton('咨询排序', /(追踪|全新)/, [0.5, 0, 1, 0.5]);
// page_gacha
buttons.GACHA_CHECK = new TextButton('抽卡页面', /积分/, [0.1, 0, 0.9, 0.3]);
buttons.GACHA_RECRUIT_1 = new TextButton('招募1名', /1名/, [0, 0.5, 0.6, 1]);
// page_event
buttons.EVENT_ENTRY = new TextButton('活动入口', /出击$/, [0.5, 0.5, 1, 1], 0.5, (rect) => {
  let h = rect.height();
  rect.top += h;
  rect.bottom += h;
  return rect;
});
buttons.EVENT_ENTER = new TextButton('活动页面', /ENTER/i, [0, 0, 1, 1]);
buttons.EVENT_CHALLENGE = new TextButton('活动挑战', /挑战/, [0, 0.4, 1, 1]);
buttons.EVENT_MISSION = new TextButton('活动任务', /任务/, [0, 0.4, 1, 1]);
buttons.EVENT_REMAINING_TIME = new TextButton('活动剩余时间', /余时间/, [0, 0, 1, 1]);
// page_minigame
buttons.MINIGAME_ENTRY = new TextButton('小游戏入口', /小游戏/, [0.1, 0.5, 0.9, 1]);
buttons.MINIGAME_CHECK = new TextButton('小游戏页面', /(甜点突袭|戏方法)/, [0, 0, 0.5, 1]);

module.exports = buttons;