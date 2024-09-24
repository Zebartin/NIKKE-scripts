
const NikkeUI = require('../base/ui');
const { pageFriends } = require('../base/page');
const { SEND, FRIEND_LIST_UPPERBOUND, SOME_FRIEND, FRIEND_DETAIL } = require('./assets/friends');

class Friends extends NikkeUI {
  run() {
    this.uiEnsure(pageFriends);
    this.#ensureLoaded();
    this.#send();
    this.config.taskDelay(false, null, 60);
  }
  #ensureLoaded(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(FRIEND_DETAIL))
        break;
      if (this.appear(SEND) && this.appear(FRIEND_LIST_UPPERBOUND)) {
        if (this.appearThenClick(SOME_FRIEND, 2000, 2))
          continue;
      }
    }
    skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(SEND))
        break;
      if (this.appear(FRIEND_DETAIL)) {
        this.device.back();
        continue;
      }
    }
  }
  #send(skipFirstScreenshot = true) {
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(SEND, 1000)) {
        if (this.imageColorCount(SEND, '#00aeff', 221, 500))
          this.device.click(SEND);
        else
          break;
      }
      if (this.handleConfirm())
        continue;
    }
  }
}

module.exports = Friends;