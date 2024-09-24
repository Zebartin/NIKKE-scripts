const Script = require('../../../../common/base/script');
const NikkeConfig = require('../../config/config');

class NikkeScript extends Script {
  constructor(configName) {
    super(configName, NikkeConfig);
    /**@type {NikkeConfig} */
    this.config;
    this.restarted = false;
    this.started = this.getNextTask() != null;
    if (this.started)
      this.config.taskCall('Start');
  }
  allTasksDone() {
    if (!this.started)
      return;
    if (this.config.General_AfterAllDone == 'exit_game') {
      this.Exit();
    } else if (this.config.General_AfterAllDone == 'goto_main') {
      this.GoToMain();
    }
  }
  GoToMain() {
    const NikkeUI = require('./ui');
    const { pageMain } = require('./page');
    new NikkeUI(this.config, this.device).uiEnsure(pageMain);
  }
  Restart() {
    const Login = require('../login/login');
    new Login(this.config, this.device).appRestart(this.restarted);
    this.restarted = true;
    this.config.Scheduler_Enable = false;
  }
  Start() {
    const Login = require('../login/login');
    new Login(this.config, this.device).appStart();
  }
  Exit() {
    const Login = require('../login/login');
    new Login(this.config, this.device).appStop();
  }
  OutpostBulletin() {
    const BulletinBoard = require('../outpost/bulletin');
    new BulletinBoard(this.config, this.device).run();
  }
  OutpostWipeOut() {
    const OutpostDefense = require('../outpost/defense');
    new OutpostDefense(this.config, this.device).wipeOut();
  }
  OutpostDefense() {
    const OutpostDefense = require('../outpost/defense');
    new OutpostDefense(this.config, this.device).claimReward();
  }
  Friends() {
    const Friends = require('../friends/friends');
    new Friends(this.config, this.device).run();
  }
  RookieArena() {
    const RookieArena = require('../arena/rookie');
    new RookieArena(this.config, this.device).run();
  }
  SpecialArena() {
    const SpecialArena = require('../arena/special');
    new SpecialArena(this.config, this.device).run();
  }
  Shop() {
    const Shop = require('../shop/shop');
    new Shop(this.config, this.device).run();
  }
  RecyclingShop() {
    const RecyclingShop = require('../shop/recycling');
    new RecyclingShop(this.config, this.device).run();
  }
  CashShopDaily() {
    const CashShop = require('../shop/cash');
    new CashShop(this.config, this.device).daily();
  }
  CashShopWeekly() {
    const CashShop = require('../shop/cash');
    new CashShop(this.config, this.device).weekly();
  }
  CashShopMonthly() {
    const CashShop = require('../shop/cash');
    new CashShop(this.config, this.device).monthly();
  }
  TribeTower() {
    const Tower = require('../tower/tower');
    new Tower(this.config, this.device).run();
  }
  Advising() {
    const Advising = require('../advising/advising');
    new Advising(this.config, this.device).run();
  }
  SemiCombat() {
    const Combat = require('../handlers/combat');
    let c = new Combat(this.config, this.device);
    while(true) {
      c.executeCombat();
    }
  }
  MiniGame(){
    const MiniGame = require('../event/minigame');
    new MiniGame(this.config, this.device).run();
  }
}
module.exports = NikkeScript;