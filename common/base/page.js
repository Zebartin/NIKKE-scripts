const { Button } = require("./button");

class Page {
  /** @type {Set<Page>} */
  static allPages;
  static {
    Page.allPages = new Set();
  }
  /**
   * 
   * @param {string} name 
   * @param {Button[]} whiteListButtons
   * @param {Button[]} blackListButtons
   */
  constructor(name, whiteListButtons, blackListButtons = []) {
    if (whiteListButtons instanceof Button) {
      whiteListButtons = [whiteListButtons];
    }
    if (blackListButtons instanceof Button) {
      blackListButtons = [blackListButtons];
    }
    /** @type {string} */
    this.name = name;
    /** @type {Button[]} */
    this.whiteListButtons = whiteListButtons;
    /** @type {Button[]} */
    this.blackListButtons = blackListButtons;
    /** @type {Set<Page>} */
    this.prevPages = new Set();
    /** @type {Map<Page, Button>} */
    this.links = new Map();
    Page.allPages.add(this);
  }
  /**
   * 
   * @param {Button} button 
   * @param {Page} nextPage 
   */
  link(button, nextPage) {
    this.links.set(nextPage, button);
    nextPage.prevPages.add(this);
  }
  equals(page) {
    return this.name == page.name;
  }
}

module.exports = Page;