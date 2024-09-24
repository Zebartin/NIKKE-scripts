/**
 * Timer class
 *
 * @constructor
 * @param {Number} limit - timeout limit in millisecond
 * @param {Number} count - minimum count to be confirmed
 */
class Timer {
  #current;
  #reachedCount;
  constructor(limit, count = 0) {
    this.limit = limit;
    this.count = count;
    this.#current = 0;
    this.#reachedCount = this.count;
  }
  started() {
    return this.#current > 0;
  }
  start() {
    if (!this.started()) {
      return this.reset();
    }
    return this;
  }
  reached() {
    this.#reachedCount++;
    return this.#reachedCount > this.count &&
      Date.now() > this.limit + this.#current
  }
  reset() {
    this.#current = Date.now();
    this.#reachedCount = 0;
    return this;
  }
  clear() {
    this.#current = 0;
    this.#reachedCount = this.count;
    return this;
  }
  current() {
    if (this.started()) {
      return Date.now() - this.#current;
    }
    return 0;
  }
  wait() {
    let diff = this.#current + this.limit - Date.now();
    if (diff > 0) {
      sleep(diff);
    }
  }
  reachedAndReset() {
    if (this.reached()) {
      this.reset();
      return true;
    }
    return false;
  }
  toString() {
    return `Timer(limit=${(this.current() / 1000).toFixed(3)}/${(this.limit / 1000).toFixed(3)}, count=${this.#reachedCount}/${this.count})`;
  }
}

module.exports = Timer;