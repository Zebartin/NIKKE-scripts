const { dateToString } = require('../config/utils');
const logger = require('./logger');
const Config = require('../config/config');
const Device = require('../device/device');
const { TaskEnd, NotRunningError, StuckError, TooManyClicksError, PageUnknownError } = require('./error');

class Script {
  constructor(configName, configClass = Config) {
    this.config = new configClass(configName);
    this.device = new Device(this.config);
    this.failureRecord = new Map();
    this.logFile = null;
    this.initLogger();
  }
  initLogger() {
    let logDir = './logs/';
    let fileName = dateToString(new Date()).split(' ')[0] + '.txt';
    this.logFile = files.path(files.join(logDir, fileName));
    files.ensureDir(logDir);
    logger.init(this.logFile);
  }
  Restart() {
    this.config.Scheduler_Enable = false;
  }
  run(command) {
    try {
      // this.device.screenshot();
      this[command]();
      return true;
    } catch (err) {
      if (err instanceof TaskEnd) {
        return true;
      }
      if (err instanceof NotRunningError) {
        logger.warning(err.message);
        this.config.taskCall('Restart');
        return true;
      }
      let tolerableError = [StuckError, TooManyClicksError, PageUnknownError];
      for (let errorClass of tolerableError)
        if (err instanceof errorClass) {
          logger.trace(err.message);
          this.saveErrorLog();
          let delay = 10;
          logger.warning(`App stucks, and will be restarted in ${delay} seconds`);
          this.config.taskCall('Restart');
          sleep(delay * 1000);
          return false;
        }
      // Others...
      if (!err.message.includes('InterruptedException')) {
        logger.trace(err.message);
        this.saveErrorLog();
        throw err;
      }
    }
  }
  getNextTask() {
    let task = this.config.getNextTask();
    this.config.currentTask = task;
    return task;
  }
  loop() {
    logger.debug(`Start scheduler loop: ${this.config.configName}`);
    while (true) {
      let task = this.getNextTask();
      if (task === null) {
        //end
        this.allTasksDone();
        return;
      }
      logger.debug(`Scheduler: Start task ${task}`);
      logger.hr(task.split(/(?=[A-Z])/).join(' '));
      this.device.stuckRecordClear();
      this.device.clickRecordClear();
      let succeeded = this.run(task);
      logger.debug(`Scheduler: End task ${task}`);
      let failed = 0;
      if (!succeeded) {
        failed = (this.failureRecord.get(task) || 0) + 1;
      }
      this.failureRecord.set(task, failed);
      if (failed >= this.config.General_RetryTime) {
        logger.error(`Task ${task} failed ${failed} times`);
        logger.error('Request human takeover');
        this.allTasksDone();
        return;
      }
    }
  }
  allTasksDone() {
    this.device.stopScreenshot();
    return;
  }
  saveErrorLog() {
    let current = dateToString(new Date()).replace(' ', '_').replace(/:/g, '-');
    let errorDir = `./logs/error/${current}/`;
    files.ensureDir(errorDir);
    let errorLog = files.path(files.join(errorDir, 'error.txt'));
    let errorImage = files.path(files.join(errorDir, 'error.png'));
    if (this.device.image != null) {
      this.device.imageSave(null, errorImage);
    } else {
      logger.error('No screenshot captured');
    }
    this.device.logOcrResult();
    let lines = files.read(this.logFile).split('\n');
    let startIndex = lines.length - 1;
    let lastCount = 2;
    for (; startIndex > 0; startIndex--) {
      if (lines[startIndex].match(/ === .+ ===$/) != null)
        lastCount--;
      if (lastCount == 0)
        break;
    }
    lines = lines.slice(startIndex);
    files.write(errorLog, lines.join('\n'));
  }
}

module.exports = Script;