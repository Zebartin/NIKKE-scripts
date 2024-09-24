const Page = require('../../../../common/base/page');
const buttons = require('./assets/page');

let pages = {};
pages.pageMain = new Page('page_main', [
  buttons.SHOP, buttons.ARK
]);

pages.pageTeam = new Page('page_team', [
  buttons.TEAM_CHECK_0, buttons.TEAM_CHECK_1,
  buttons.TEAM_CHECK_2
]);
pages.pageTeam.link(buttons.LOBBY, pages.pageMain);

pages.pageOutpost = new Page('page_outpost', [
  buttons.COMMAND_CENTER, buttons.OUTPOST_TO_BULLETIN
], [
  buttons.BULLETIN_BOARD_CHECK, buttons.STAGE_CLEAR
]);
pages.pageOutpost.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.OUTPOST, pages.pageOutpost);

pages.pageOutpostDefense = new Page('page_outpost_defense', [
  buttons.STAGE_CLEAR
]);
pages.pageOutpostDefense.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.MAIN_TO_OUTPOST_DEFENSE, pages.pageOutpostDefense);
pages.pageOutpostDefense.link(buttons.BACK, pages.pageOutpost);
pages.pageOutpost.link(buttons.OUTPOST_TO_DEFENSE, pages.pageOutpostDefense);

pages.pageBulletinBoard = new Page('page_bulletin_board', [
  buttons.BULLETIN_BOARD_CHECK
]);
pages.pageBulletinBoard.link(buttons.BACK, pages.pageOutpost);
pages.pageOutpost.link(buttons.OUTPOST_TO_BULLETIN, pages.pageBulletinBoard);

pages.pageFriends = new Page('page_friends', [
  buttons.FRIENDS_CHECK
]);
pages.pageFriends.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.MAIN_TO_FRIENDS, pages.pageFriends);

pages.pageArk = new Page('page_ark', [
  buttons.ARK_TO_TOWER, buttons.ARK_TO_ARENA, buttons.ARK_TO_SIMULATION_ROOM
]);
pages.pageArk.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.ARK, pages.pageArk);

pages.pageArena = new Page('page_arena', [
  buttons.ROOKIE_ARENA, buttons.SPECIAL_ARENA
]);
pages.pageArena.link(buttons.BACK, pages.pageArk);
pages.pageArena.link(buttons.HOME, pages.pageMain);
pages.pageArk.link(buttons.ARK_TO_ARENA, pages.pageArena);

pages.pageRookieArena = new Page('page_rookie_arena', [
  buttons.ARENA_CHECK, buttons.ROOKIE_ARENA_CHECK
]);
pages.pageRookieArena.link(buttons.BACK, pages.pageArena);
pages.pageRookieArena.link(buttons.HOME, pages.pageMain);
pages.pageArena.link(buttons.ROOKIE_ARENA, pages.pageRookieArena);

pages.pageSpecialArena = new Page('page_special_arena', [
  buttons.ARENA_CHECK, buttons.SPECIAL_ARENA_CHECK
]);
pages.pageSpecialArena.link(buttons.BACK, pages.pageArena);
pages.pageSpecialArena.link(buttons.HOME, pages.pageMain);
pages.pageArena.link(buttons.SPECIAL_ARENA, pages.pageSpecialArena);

pages.pageGeneralShop = new Page('page_general_shop', [
  buttons.GENERAL_SHOP_CHECK
]);
pages.pageGeneralShop.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.SHOP, pages.pageGeneralShop);

pages.pageArenaShop = new Page('page_arena_shop', [
  buttons.ARENA_SHOP_CHECK
]);
pages.pageArenaShop.link(buttons.BACK, pages.pageMain);
pages.pageGeneralShop.link(buttons.ARENA_SHOP_ENTRANCE, pages.pageArenaShop);

pages.pageRecyclingShop = new Page('page_recycling_shop', [
  buttons.RECYCLING_SHOP_CHECK
]);
pages.pageRecyclingShop.link(buttons.BACK, pages.pageMain);
pages.pageRecyclingShop.link(buttons.ARENA_SHOP_ENTRANCE, pages.pageArenaShop);
pages.pageGeneralShop.link(buttons.RECYCLING_SHOP_ENTRANCE, pages.pageRecyclingShop);
pages.pageArenaShop.link(buttons.RECYCLING_SHOP_ENTRANCE, pages.pageRecyclingShop);

pages.pageTower = new Page('page_tower', [
  buttons.TOWER_CHECK, buttons.TOWER_OPEN
]);
pages.pageTower.link(buttons.BACK, pages.pageArk);
pages.pageTower.link(buttons.HOME, pages.pageMain);
pages.pageArk.link(buttons.ARK_TO_TOWER, pages.pageTower);

pages.pageNikke = new Page('page_nikke', [
  buttons.NIKKE_CHECK, buttons.NIKKE_TO_LIBERATION,
  buttons.NIKKE_TO_ADVISING
]);
pages.pageNikke.link(buttons.LOBBY, pages.pageMain);
pages.pageMain.link(buttons.MAIN_TO_NIKKE, pages.pageNikke);

pages.pageAdvising = new Page('page_advising', [
  buttons.ADVISING_CHECK, buttons.ADVISING_ORDER
]);
pages.pageAdvising.link(buttons.BACK, pages.pageNikke);
pages.pageAdvising.link(buttons.HOME, pages.pageMain);
pages.pageNikke.link(buttons.NIKKE_TO_ADVISING, pages.pageAdvising);

pages.pageGacha = new Page('page_gacha', [
  buttons.GACHA_CHECK, buttons.GACHA_RECRUIT_1
]);
pages.pageGacha.link(buttons.LOBBY, pages.pageMain);

pages.pageEvent = new Page('page_event', [
  buttons.EVENT_ENTER, buttons.EVENT_CHALLENGE,
  buttons.EVENT_MISSION, buttons.EVENT_REMAINING_TIME
]);
pages.pageEvent.link(buttons.BACK, pages.pageMain);
pages.pageMain.link(buttons.EVENT_ENTRY, pages.pageEvent);

pages.pageMiniGame = new Page('page_minigame', [
  buttons.MINIGAME_CHECK
]);
pages.pageMiniGame.link(buttons.BACK, pages.pageEvent);
pages.pageEvent.link(buttons.MINIGAME_ENTRY, pages.pageMiniGame);

module.exports = pages;
