const Timer = require('../../../../common/base/timer');
const { TextButton } = require('../../../../common/base/button');
const logger = require('../../../../common/base/logger');
const { mostSimilar } = require('../base/utils');
const AdvisingUI = require('./ui');
const { VIEW_EPISODE, RANK_MAX, START_ADVISE, CONFIRM_ADVISE, MAX_WARNING, CANCEL_ADVISE, RANK_INCREASE } = require('./assets/ui');
const { pageAdvising } = require('../base/page');

class Advising extends AdvisingUI {
  run() {
    this.uiEnsure(pageAdvising);
    let limit = this.getLimit();
    if (limit == 0) {
      this.config.taskDelay(true);
      return;
    }
    this.selectFirstNikke();
    for (let i = 0; i < this.allNikkeNames.length; ++i) {
      if (this.adviseOne())
        limit--;
      if (limit == 0)
        break;
      this.ensureSwitch();
    }
    this.backToAdvisingHome();
    if (limit == 0) {
      this.config.taskDelay(true);
    } else {
      logger.warning('未能用完全部咨询次数');
      this.config.taskDelay(false, null, 60);
    }
  }
  adviseOne() {
    let name = this.currentNikkeName;
    if (name === null)
      return false;
    logger.attr('咨询对象', name);
    let maxRetry = 5;
    let answers = this.answers[name];
    for (let i = 1; i <= maxRetry; ++i) {
      if (!this.#startAdvising())
        break;
      logger.debug(`尝试咨询：${i}/${maxRetry}`);
      let done = this.#chooseOption(answers, i == maxRetry);
      this.#exitAdvising(done);
      if (done)
        return true;
    }
    return false;
  }
  #startAdvising() {
    let skipFirstScreenshot = true;
    let maxMsg = '好感度已达上限';
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(RANK_MAX)) {
        logger.info(maxMsg);
        break;
      }
      if (this.appear(CONFIRM_ADVISE, 2000, 2)) {
        if (this.appear(MAX_WARNING)) {
          logger.info(maxMsg);
          break;
        }
        this.device.click(CONFIRM_ADVISE);
        continue;
      }
      if (this.isStoryOngoing())
        return true;
      if (this.appear(VIEW_EPISODE) && this.appear(START_ADVISE, 2000, 2)) {
        if (this.imageColorCount(START_ADVISE, [141, 141, 141])) {
          logger.info('不可咨询');
          return false;
        }
        this.device.click(START_ADVISE);
        continue;
      }
    }
    skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appearThenClick(CANCEL_ADVISE, 1000, 2))
        continue;
      if (!this.appear(MAX_WARNING) && !this.appear(CONFIRM_ADVISE))
        return false;
    }
  }
  #exitAdvising(skip = true) {
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(VIEW_EPISODE))
        break;
      if (this.appearThenClick(RANK_INCREASE, 1000, 2))
        continue;
      if (!skip && this.handleStoryCancel())
        continue;
      if (skip && this.handleStorySkip())
        continue;
    }
  }
  /**
   * 
   * @param {string[]} answers 
   * @param {boolean} forceChoose 
   * @returns {boolean} chosen or not
   */
  #chooseOption(answers, forceChoose = false) {
    let options = this.storyStopAtSpecialOptions().map(x => this.#rectToOption(x, answers));
    if (options.length == 0) {
      logger.warning('无法检测到咨询选项');
      return false;
    }
    let bestOption = options[0];
    let bestIndex = 0;
    for (let j = 0; j < options.length; ++j) {
      let o = options[j];
      logger.debug(`选项${j + 1}："${o.button.text}"`);
      logger.debug(`匹配："${o.answer}"，相似度${o.similarity.toFixed(2)}`);
      if (bestOption.similarity < o.similarity) {
        bestOption = o;
        bestIndex = j;
      }
    }
    let threshold = bestOption.button.text.length < 3 ? 1 : 0.75;
    if (bestOption.similarity < threshold) {
      if (forceChoose) {
        logger.warning('尝试次数过多，无视低相似度');
        if (options[1 - bestIndex].button.text == "") {
          logger.debug('优先选择空选项（可能是省略号之类）');
          bestIndex = 1 - bestIndex;
          bestOption = options[bestIndex];
        }
      } else {
        logger.info('相似度过低，放弃本次咨询');
        return false;
      }
    }
    logger.debug(`咨询选择："${bestOption.button.text}"`);
    let skipFirstScreenshot = true;
    let clickInterval = new Timer(1000, 2);
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.isStoryCanSkip() || this.appear(VIEW_EPISODE))
        return true;
      if (clickInterval.reachedAndReset()) {
        this.device.click(bestOption.button);
        continue;
      }
    }
  }
  /**
   * 
   * @param {Rect} rect 
   * @param {string[]} answers 
   * @returns {{button: TextButton, answer: string, similarity: number}}
   */
  #rectToOption(rect, answers) {
    let text = this.device.ocrResult.toArray(3).toArray().filter(x =>
      x.bounds.top >= rect.top &&
      x.bounds.bottom <= rect.bottom
    );
    if (text.length == 0)
      text = '';
    else
      text = text.map(x => x.text).join('');
    text = text.replace(/[,，:：\.。…\?\!？！、「」～~☆【】♪\s-\—]/g, '');
    let button = new TextButton('剧情选项', null, null, 0.8);
    button.button = rect;
    button.text = text;
    let result = mostSimilar(text, answers);
    return {
      button: button,
      answer: result.result,
      similarity: result.similarity
    }
  }
}

module.exports = Advising;