const { NotRunningError } = require('../../../../common/base/error');

class GameNotRunningError extends NotRunningError {
  constructor(message) {
    super(message);
    this.name = 'GameNotRunningError';
    Object.setPrototypeOf(this, GameNotRunningError.prototype);
  }
}

class GameNotLoginError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GameNotLoginError';
    Object.setPrototypeOf(this, GameNotLoginError.prototype);
  }
}

class GameUnderMaintenanceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GameUnderMaintenanceError';
    Object.setPrototypeOf(this, GameUnderMaintenanceError.prototype);
  }
}

module.exports = {
  GameNotRunningError,
  GameNotLoginError,
  GameUnderMaintenanceError
}