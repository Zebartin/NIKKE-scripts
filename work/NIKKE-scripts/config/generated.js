const Config = require('../../../common/config/config');

class NikkeConfigGenerated extends Config {
  General_Tasks = ['Start', 'Restart', 'OutpostBulletin', 'OutpostWipeOut', 'OutpostDefense', 'Friends', 'RookieArena', 'SpecialArena', 'Shop', 'RecyclingShop', 'CashShopDaily', 'CashShopWeekly', 'CashShopMonthly', 'TribeTower', 'Advising'];
  General_ScreenshotInterval = 300;
  General_ServerUpdate = '04:00';
  General_RetryTime = 3;
  General_TagName = '';
  General_Mute = true;
  General_Magic = 'v2rayNG';
  General_AfterAllDone = 'goto_main';

  Scheduler_Enable = true;
  Scheduler_NextRun = new Date();

  RookieArena_Target = 0;

  GeneralShop_BuyCoreDust = true;
  GeneralShop_BuyBondItem = false;
  ArenaShop_ManualCount = 3;

  RecyclingShop_ShoppingList = ['珠宝', '芯尘盒', '成长套组', '好感券-通用', '好感券-极乐净土', '好感券-米西利斯', '好感券-泰特拉', '好感券-朝圣者', '好感券-反常', '芯尘盒', '信用点盒'];

  Advising_AnswerPath = './nikke.json';
  Advising_Limit = 0;

  SimulationRoom_MaxPass = 0;
  SimulationRoom_MaxSsr = 0;
  SimulationRoom_TryDiffArea = 8;
  SimulationRoom_PreferredBuffs = [];

  DailyMission_MissionPass = true;
  DailyMission_Liberation = true;
  DailyMission_SocialPointRecruit = true;
  EquipmentEnhance_Target = '';
  EquipmentEnhance_Slot = '';
  constructor(configName) {
    super(configName);
    this.initProperties();
  }
}

module.exports = NikkeConfigGenerated;