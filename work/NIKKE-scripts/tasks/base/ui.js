const { HOME } = require('./assets/page');
const PopupHandler = require('./popup');

class NikkeUI extends PopupHandler {
  uiAdditional() {
    if (this.handleAnnoucement())
      return true;
    if (this.handleLoginEvent())
      return true;
    if (this.handlePopupMessage())
      return true;
    if (this.handleReview())
      return true;
    if (this.handleSale())
      return true;
    if (this.handleExitGame())
      return true;
    return super.uiAdditional();
  }
  uiGoToMain() {
    if (this.appearThenClick(HOME, 5000, 3))
      return true;
    return super.uiGoToMain();
  }
}

module.exports = NikkeUI;