const { limitIn, matchFeature, scaleRect } = require('./utils');
class Button {
  /** @type {Rect} */
  #button;
  /**
   * @param {string} name
   * @param {Function | number[]} search
   * @param {number} scale
   */
  constructor(name, search = [0, 0, 1, 1], scale = 1, afterMatch = null) {
    this.name = name;
    this.search = search;
    this.scale = limitIn(scale, 0.1, 1);
    this.afterMatch = afterMatch || (x => x);
    this.#button = null;
    if (Array.isArray(this.search)) {
      for (let i = 0; i < 4; ++i) {
        let d = i < 2 ? 0 : 1;
        this.search[i] = limitIn(this.search[i] || d, 0, 1);
      }
    }
  }
  clone() {
    return new Button(this.name, this.search, this.scale);
  }
  get button() {
    return this.#button;
  }
  /**
   * @param {Rect} rect
   */
  set button(rect) {
    if (this.scale < 1) {
      rect = scaleRect(rect, this.scale);
    }
    this.#button = rect;
  }
}

class ImageButton extends Button {
  /** @type {Image?} */
  #image;
  /** @type {number[]?} */
  #region;
  constructor(name, file, search = [0, 0, 1, 1], scale = 1, afterMatch = null) {
    super(name, search, scale, afterMatch);
    if (files.exists(file)) {
      this.file = file;
    } else {
      this.file = files.join('./NIKKE-scripts', file);
      if (!files.exists(this.file))
        throw new Error('File not found: ' + file);
    }
    this.#image = null;
    this.#region = null;
  }
  clone() {
    return new ImageButton(this.name, this.file, this.search, this.scale);
  }
  get template() {
    if (this.#image === null) {
      this.#image = images.read(this.file);
    }
    return this.#image;
  }
  /**
   * 
   * @param {Rect} area 
   */
  setRegion(area) {
    this.#region = [
      area.left, area.top,
      area.width(), area.height()
    ];
  }
  getRegion(image) {
    if (this.#region === null && Array.isArray(this.search)) {
      let w = image.width, h = image.height;
      this.#region = [];
      this.#region.push(this.search[0] * w);
      this.#region.push(this.search[1] * h);
      this.#region.push((this.search[2] - this.search[0]) * w);
      this.#region.push((this.search[3] - this.search[1]) * h);
    }
    return this.#region;
  }
  recycleImage() {
    if (this.#image) {
      this.#image.recycle();
    }
    this.#image = null;
  }
  matchTemplate(image, similarity = 0.85) {
    if (!similarity) {
      return false;
    }
    let options = {
      threshold: similarity,
      region: this.getRegion(image)
    };
    let result = images.findImage(image, this.template, options);
    if (result === null) {
      this.recycleImage();
      return false;
    }
    this.button = this.afterMatch(new android.graphics.Rect(
      result.x, result.y,
      result.x + this.template.width,
      result.y + this.template.height
    ), image);
    this.recycleImage();
    return this.button != null;
  }
  matchFeature(image, minMatchCount = 4) {
    if (!minMatchCount) {
      return false;
    }
    let result = matchFeature(image, this.template, this.getRegion(image), minMatchCount, false);
    if (result === null) {
      this.recycleImage();
      return false;
    }
    this.button = this.afterMatch(result, image);
    this.recycleImage();
    return this.button != null;
  }
  matchImage(image, similarity = 0.85, minMatchCount = 4) {
    if (this.matchTemplate(image, similarity)) {
      return true;
    }
    if (this.matchFeature(image, minMatchCount)) {
      return true;
    }
    return false;
  }
}

class TextButton extends Button {
  /**
   * @param {String}  name
   * @param {Function|Array.<number>}  search
   * @param {String|Function|RegExp} matchedText
   */
  constructor(name, matchedText, search = [0, 0, 1, 1], scale = 1, afterMatch = null) {
    super(name, search, scale, afterMatch);
    if (typeof matchedText === 'string') {
      matchedText = new RegExp(matchedText || name);
    }
    this.matchedText = matchedText;
    this.text = null;
  }
  clone() {
    return new TextButton(this.name, this.matchedText, this.search, this.scale);
  }
  /**
   * Determines if the button is in search region.
   *
   * @param {Rect}  rect
   * @param {Image} image
   * @return {boolean} Returns a boolean value indicating whether the button is in search region.
   */
  inSearch(rect, image) {
    if (!rect) {
      return false;
    }
    if (typeof this.search === 'function') {
      return this.search(rect, image);
    }
    if (Array.isArray(this.search)) {
      let w = image.width, h = image.height;
      let ret = rect.left >= w * this.search[0];
      ret = ret && rect.top >= h * this.search[1];
      ret = ret && rect.right <= w * this.search[2];
      ret = ret && rect.bottom <= h * this.search[3];
      return ret;
    }
    return true;
  }
  textMatched(x) {
    if (typeof this.matchedText === 'function') {
      return x && this.matchedText(x);
    }
    if (this.matchedText instanceof RegExp) {
      return this.matchedText.test(x);
    }
    return true;
  }
  /**
   * 
   * @param {Image} image 
   * @param {OcrResult} ocrResult 
   * @returns 
   */
  matchText(image, ocrResult) {
    if (!ocrResult) {
      return false;
    }
    let matched = ocrResult.find(e =>
      this.textMatched(e.text) &&
      this.inSearch(e.bounds, image)
    );
    if (!matched) {
      return false;
    }
    this.button = this.afterMatch(matched.bounds, image);
    this.text = matched.text;
    return this.button != null;
  }
  matchMultiText(image, ocrResult) {
    if (!ocrResult) {
      return [];
    }
    let matched = ocrResult.toArray(3).toArray().filter(e =>
      this.textMatched(e.text) &&
      this.inSearch(e.bounds, image)
    );
    let ret = [];
    matched.sort((a, b) => {
      let t = a.bounds.bottom - b.bounds.bottom;
      if (Math.abs(t) < 10)
        return a.bounds.left - b.bounds.left;
      return t;
    })
    for (let i = 0; i < matched.length; i++) {
      let name = this.name;
      if (matched.length > 1) {
        name = `${this.name}_${i}`;
      }
      let button = new TextButton(name, this.matchedText);
      button.button = this.afterMatch(matched[i].bounds, image);
      button.text = matched[i].text;
      ret.push(button);
    }
    return ret;
  }
}

module.exports = {
  Button,
  ImageButton,
  TextButton
};
