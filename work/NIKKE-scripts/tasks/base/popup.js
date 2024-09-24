const logger = require('../../../../common/base/logger');
const UI = require('../../../../common/base/ui');
const NikkeConfig = require('../../config/config');
const { CLAIM_REWARD, CONFIRM, DONT_SHOW_UP, ANNOUCEMENT, LOGIN_EVENT_CHECK, LOGIN_EVENT_CLAIM, REVIEW_NOTIFICATION, REVIEW_CLOSE, SALE_CLOSE, SALE_CLOSE_POPUP, EXIT_GAME_POPUP } = require('./assets/popup');

class PopupHandler extends UI {
  #rewardScale = 1;
  #loginEventClaimed = false;
  constructor(config, device) {
    super(config, device);
    /**@type {NikkeConfig} */
    this.config;
  }
  /**
   * 点击领取奖励
   * @param {number} interval 
   * @returns {boolean}
   */
  handleReward(interval = 5000) {
    this.device.setOcrPreprocess(null, this.#rewardScale, false);
    let appear = this.appearThenClick(CLAIM_REWARD, interval, 2);
    this.device.resetOcr();
    this.#rewardScale = (this.#rewardScale % 4) + 1;
    return appear;
  }
  handleConfirm(interval = 2000) {
    return this.appearThenClick(CONFIRM, interval);
  }
  /**
   * 不再显示……
   * @param {number} interval 
   * @returns {boolean}
   */
  handlePopupMessage(interval = 2000) {
    let appear = this.appearThenClick(DONT_SHOW_UP, interval);
    if (appear) {
      sleep(500);
      this.device.back();
    }
    return appear;
  }
  /**
   * 公告
   * @param {number} interval 
   * @returns {boolean}
   */
  handleAnnoucement(interval = 5000) {
    let appear = this.appear(ANNOUCEMENT, interval);
    if (appear) {
      logger.debug('游戏公告');
      this.device.back();
    }
    return appear;
  }
  /**
   * 登录奖励
   * TODO 需要优化
   * @param {number} interval 
   * @returns {boolean}
   */
  handleLoginEvent(interval = 5000) {
    if (!this.appear(LOGIN_EVENT_CHECK, interval)) {
      if (this.#loginEventClaimed) {
        let handled = this.handleReward();
        if (handled) {
          this.#loginEventClaimed = false;
        }
        return handled;
      }
      return false;
    }
    let claimButtons = LOGIN_EVENT_CLAIM.matchMultiText(this.device.image, this.device.ocrResult);
    if (claimButtons.length == 0) {
      logger.debug('未找到登录奖励的领取按钮');
      // this.device.back();
      return false;
    }
    let claim = claimButtons[claimButtons.length - 1];
    if (this.imageColorCount(claim, '#737373', 221, 1200)) {
      logger.debug('今日登录奖励已领取');
      this.device.back();
      return false;
    }
    this.device.click(claim);
    this.#loginEventClaimed = true;
    return true;
  }
  /**
   * APP评价
   * @param {number} interval 
   * @returns {boolean}
   */
  handleReview(interval = 5000) {
    return this.appear(REVIEW_NOTIFICATION, interval) && this.appearThenClick(REVIEW_CLOSE, interval);
  }
  /**
   * 限时礼包
   * @param {number} interval 
   * @returns {boolean}
   */
  handleSale(interval = 5000) {
    if (this.appear(SALE_CLOSE_POPUP, interval, 2)) {
      return this.handleConfirm();
    }
    if (this.appearThenClick(SALE_CLOSE, interval, 2)) {
      logger.debug('关闭限时礼包');
      return true;
    }
    return false;
  }
  /**
   * 避免返回过多
   * @param {number} interval 
   * @returns {boolean}
   */
  handleExitGame(interval = 5000) {
    if (this.appear(EXIT_GAME_POPUP, interval)) {
      this.device.back();
      return true;
    }
    return false;
  }
}

module.exports = PopupHandler;