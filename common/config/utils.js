let utils = {};

/**
 * 
 * @param {Object} d 
 * @param {string[] | string} keys 
 * @param {*} defaultValue 
 */
utils.deepGet = function (d, keys, defaultValue = null) {
  if (!Array.isArray(keys)) {
    keys = keys.split('.');
  }
  if (d === null || d === undefined) {
    return defaultValue;
  }
  if (keys.length === 0) {
    return d;
  }
  return utils.deepGet(d[keys[0]], keys.slice(1), defaultValue);
};
/**
 * 
 * @param {Object} d 
 * @param {string[] | string} keys 
 * @param {*} value 
 */
utils.deepSet = function (d, keys, value) {
  if (!Array.isArray(keys)) {
    keys = keys.split('.');
  }
  if (keys.length === 0) {
    return value;
  }
  if (d === null || d === undefined) {
    d = {};
  }
  d[keys[0]] = utils.deepSet(d[keys[0]], keys.slice(1), value);
  return d;
}
/**
 * 
 * @param {string | Date} date
 */
utils.dateToString = function (date) {
  let s = date;
  if (date instanceof Date) {
    s = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  }
  return s.slice(0, 10) + ' ' + s.slice(11, 19);
}
/**
 * @param {string[] | string} dailyTrigger
 */
utils.getNextServerUpdate = function (dailyTrigger) {
  if (!Array.isArray(dailyTrigger)) {
    dailyTrigger = dailyTrigger.split(',');
  }
  let oneDay = 24 * 60 * 60 * 1000;
  let localNow = new Date();
  let minDelta = oneDay;
  for (let t of dailyTrigger) {
    let [h, m] = t.split(':').map(x => parseInt(x));
    let future = new Date(localNow);
    future.setHours(h, m, 0, 0);
    let delta = (future - localNow + oneDay) % oneDay;
    if (delta < minDelta) {
      minDelta = delta;
    }
  }
  return new Date(localNow.getTime() + minDelta);
};

module.exports = utils;