const Timer = require('../../../../common/base/timer');
const logger = require('../../../../common/base/logger');
const Story = require('../handlers/story');
const { VIEW_EPISODE, NEXT_EPISODE, ADVISING_ALL, ADVISING_LIMIT, ADVISING_ENTRY, RANK_INCREASE, RANK, RANK_MAX } = require('./assets/ui');
const { mostSimilar } = require('../base/utils');
const { pageAdvising, pageNikke, pageMain } = require('../base/page');

class AdvisingUI extends Story {
  #answers = null;
  currentNikkeName = null;
  get answers() {
    if (this.#answers === null) {
      let answerPath = files.path(this.config.Advising_AnswerPath);
      try {
        logger.debug('开始下载最新咨询文本');
        let respStr = http.get('https://github.blindfirefly.top/https://raw.githubusercontent.com/Zebartin/autoxjs-scripts/dev/NIKKE/nikke.json').body.string();
        files.write(answerPath, respStr);
        this.#answers = JSON.parse(respStr);
        logger.debug('下载完成');
      } catch (error) {
        logger.warning(`下载最新咨询文本失败：${error.message}`);
        this.#answers = JSON.parse(files.read(answerPath));
      }
      if ('$meta' in this.#answers)
        delete this.#answers['$meta'];
    }
    return this.#answers;
  }
  get allNikkeNames() {
    return Object.keys(this.answers);
  }
  getLimit() {
    let skipFirstScreenshot = true;
    let limitConfig = this.config.Advising_Limit;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(ADVISING_ALL) && this.appear(ADVISING_LIMIT)) {
        let matched = ADVISING_LIMIT.text.match(ADVISING_LIMIT.matchedText);
        let limit = parseInt(matched[1].replace(/o/i, '0'));
        logger.debug(`咨询次数：${limit}`);
        if (limitConfig > 0 && limit > limitConfig) {
          limit = limitConfig;
          logger.debug(`咨询次数限制为：${limit}`);
        }
        return limit;
      }
    }
  }
  selectFirstNikke() {
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appear(VIEW_EPISODE))
        break;
      if (this.appear(ADVISING_LIMIT, 2000, 2)) {
        let possibleEntries = ADVISING_ENTRY.matchMultiText(this.device.image, this.device.ocrResult);
        if (possibleEntries.length > 0) {
          this.device.click(possibleEntries[0]);
          continue;
        }
      }
    }
    this.currentNikkeName = this.getNikkeName();
  }
  getNikkeName() {
    if (!this.appear(VIEW_EPISODE) || !this.appear(NEXT_EPISODE) || !this.appear(RANK))
      return null;
    let ret = null;
    let area = new android.graphics.Rect(
      0, RANK.button.bottom,
      VIEW_EPISODE.button.left, NEXT_EPISODE.button.top
    );
    let cropped = this.imageCrop(this.device.image, area);
    let img = images.grayscale(cropped);
    let maxScale = 6;
    cropped.recycle();
    for (let scale = 1; scale <= maxScale; ++scale) {
      let nameText = '';
      let result = null;
      this.device.setOcrPreprocess(img, scale);
      for (let childRes of this.device.ocrResult.toArray(3).toArray()) {
        nameText = this.#nameOcrAfterProcess(childRes);
        if (RANK_MAX.matchedText.test(nameText)) {
          continue;
        }
        if (nameText.length > 0) {
          result = mostSimilar(nameText, this.allNikkeNames);
          if (result.similarity >= 0.5) {
            ret = result.result;
            break;
          }
        }
      }
      this.device.resetOcr();
      if (ret) {
        break;
      }
      logger.debug(`妮姬名OCR结果："${nameText}"（${scale}/${maxScale}）`);
      if (result !== null) {
        logger.debug(`匹配：${result.result}，相似度${result.similarity.toFixed(2)}`)
      }
    }
    if (ret === null) {
      logger.warning('妮姬名识别失败');
      // this.device.imageSave(img);
    }
    img.recycle();
    return ret;
  }
  #nameOcrAfterProcess(nameOcrResult) {
    if (!nameOcrResult)
      return '';
    let regs = {
      豺狼: /^[豺動][狼浪]$/,
      基里: /^[雷基][费骨賽費登]$/,
      饼干: /^.*饼干.*$/,
      坎西: /^.*坎西.*$/
    }
    let ret = nameOcrResult.text.replace(/[i,\s]+$/, '').replace('\n', '');
    for (let [key, value] of Object.entries(regs))
      if (value.test(ret)) {
        if (ret != key)
          logger.attr('Nikke Name OCR', `${ret} -> ${key}`);
        return key;
      }
    return ret;
  }
  ensureSwitch() {
    let area = new android.graphics.Rect(
      this.device.width * 0.2, this.device.height * 0.3,
      this.device.width * 0.8, this.device.height * 0.5
    );
    let swipeInterval = new Timer(3000, 2);
    let skipFirstScreenshot = true;
    while (true) {
      if (skipFirstScreenshot)
        skipFirstScreenshot = false;
      else
        this.device.screenshot();
      if (this.appearThenClick(RANK_INCREASE, 1000, 2))
        continue;
      if (swipeInterval.reachedAndReset()) {
        this.device.swipe(area, 'left');
        continue;
      }
      if (this.appear(VIEW_EPISODE)) {
        let name = this.getNikkeName();
        if (name && name != this.currentNikkeName) {
          this.currentNikkeName = name;
          break;
        }
      }
    }
  }
  backToAdvisingHome() {
    let pages = [pageAdvising, pageNikke, pageMain];
    while (true) {
      this.device.back();
      this.device.screenshot();
      for (let p of pages)
        if (this.uiPageAppear(p))
          return;
    }
  }
}

module.exports = AdvisingUI;