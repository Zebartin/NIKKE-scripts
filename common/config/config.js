const logger = require('../base/logger');
const { ScriptError, TaskEnd } = require('../base/error');
const utils = require('./utils');

class Config {
  #CONFIG_DIR = './';
  #data = {};
  General_ScreenshotInterval = 300;
  General_Tasks = [];
  General_ServerUpdate = '';
  General_RetryTime = 3;

  Scheduler_Enable = true;
  Scheduler_NextRun = new Date();

  constructor(configName, initProperties = false) {
    this.configName = configName;
    this.currentTask = null;
    this.load();
    if (initProperties)
      this.initProperties();
  }
  get configPath() {
    return files.path(files.join(this.#CONFIG_DIR, this.configName + '.json'));
  }
  load() {
    if (!files.exists(this.configPath))
      return;
    try {
      this.#data = JSON.parse(
        files.read(this.configPath),
        (key, value) => {
          if (key == 'NextRun') {
            let d = new Date(value.replace(' ', 'T'));
            return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
          }
          return value;
        }
      );
    } catch (error) {
      logger.error('Cannot load config');
      throw error;
    }
  }
  save() {
    files.write(this.configPath, JSON.stringify(
      this.#data, (key, value) => {
        if (key == 'NextRun') {
          return utils.dateToString(new Date(value));
        }
        return value;
      }, 2));
  }
  getNextTask() {
    for (let t of this.General_Tasks) {
      if (!this.isTaskEnabled(t))
        continue;
      let nextRun = this.getTaskNextRun(t);
      if (!nextRun || nextRun <= new Date()) {
        return t;
      }
    }
    return null;
  }
  taskCall(task, forceCall = true) {
    let oldNextRun = this.getTaskNextRun(task);
    if (!oldNextRun && !forceCall) {
      throw new ScriptError(`Task call: "${task}" not found`);
    }
    if (!forceCall && !this.isTaskEnabled(task)) {
      logger.debug(`Task call: "${task}" skipped`);
      return false;
    }
    logger.debug(`Task call: "${task}"`);
    utils.deepSet(
      this.#data,
      [task, 'Scheduler', 'Enable'],
      true
    );
    utils.deepSet(
      this.#data,
      [task, 'Scheduler', 'NextRun'],
      new Date()
    );
    this.save();
    return true;
  }
  taskStop(message = null) {
    if (message) {
      throw new TaskEnd(message);
    } else {
      throw new TaskEnd(`Task '${this.currentTask}' stopped`);
    }
  }
  taskDelay(serverUpdate = null, target = null, minute = null, task = null) {
    if (!task) {
      task = this.currentTask;
    }
    if (!task) {
      logger.warning('No task specified in taskDelay');
      return;
    }
    let nextRun = [];
    if (serverUpdate === true) {
      let su = this.General_ServerUpdate;
      if (su) {
        nextRun.push(utils.getNextServerUpdate(su));
      }
    }
    if (target && target instanceof Date) {
      nextRun.push(target);
    }
    if (minute) {
      nextRun.push(new Date(Date.now() + minute * 60 * 1000));
    }
    if (nextRun.length === 0) {
      throw new ScriptError('Missing arguments in taskDelay');
    }
    nextRun = nextRun.reduce((a, b) => a < b ? a : b);
    logger.debug(`Delay task "${task}" to ${utils.dateToString(nextRun)}`);
    utils.deepSet(
      this.#data,
      [task, 'Scheduler', 'NextRun'],
      nextRun
    );
    this.save();
  }
  isTaskEnabled(task) {
    return utils.deepGet(
      this.#data,
      [task, 'Scheduler', 'Enable'],
      true
    );
  }
  getTaskNextRun(task) {
    return utils.deepGet(
      this.#data,
      [task, 'Scheduler', 'NextRun']
    );
  }
  initProperties() {
    const properties = Object.getOwnPropertyNames(this);
    for (const propertyName of properties) {
      if (typeof this[propertyName] === 'function')
        continue;
      if (!propertyName.includes('_'))
        continue;
      const value = this[propertyName];
      Object.defineProperty(this, propertyName, {
        get: () => {
          let keys = propertyName.split('_');
          if (keys[0] != 'General' && this.currentTask)
            keys.unshift(this.currentTask);
          return utils.deepGet(this.#data, keys, value);
        },
        set: (newValue) => {
          let oldValue = this[propertyName];
          if (newValue !== oldValue) {
            logger.attr(
              `Config '${this.configName}' ${propertyName}`,
              `${oldValue} -> ${newValue}`
            );
            let keys = propertyName.split('_');
            if (keys[0] != 'General' && this.currentTask)
              keys.unshift(this.currentTask);
            utils.deepSet(this.#data, keys, newValue);
            this.save();
          }
        }
      });
    }
  }
}

module.exports = Config;