// instanceof not working for custom errors:
// https://dannyguo.medium.com/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript-1df978100a27
class ScriptError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ScriptError';
    Object.setPrototypeOf(this, ScriptError.prototype);
  }
}

class NotRunningError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotRunningError';
    Object.setPrototypeOf(this, NotRunningError.prototype);
  }
}

class StuckError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StuckError';
    Object.setPrototypeOf(this, StuckError.prototype);
  }
}

class TooManyClicksError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TooManyClicksError';
    Object.setPrototypeOf(this, TooManyClicksError.prototype);
  }
}

class PageUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PageUnknownError';
    Object.setPrototypeOf(this, PageUnknownError.prototype);
  }
}

class LaunchAppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LaunchAppError';
    Object.setPrototypeOf(this, LaunchAppError.prototype);
  }
}

class TaskEnd extends Error {
  constructor(message) {
    super(message);
    this.name = 'TaskEnd';
    Object.setPrototypeOf(this, TaskEnd.prototype);
  }
}

module.exports = {
  ScriptError,
  NotRunningError,
  StuckError,
  TooManyClicksError,
  PageUnknownError,
  LaunchAppError,
  TaskEnd
}