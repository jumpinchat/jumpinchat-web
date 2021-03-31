module.exports.customError = function customError(name = 'Error', message) {
  const error = new Error();
  error.name = name;
  error.message = message;
  return error;
};

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
module.exports.ValidationError = ValidationError;

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports.NotFoundError = NotFoundError;

class JanusError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JanusError';
  }
}

module.exports.JanusError = JanusError;

class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PermissionError';
  }
}

module.exports.PermissionError = PermissionError;

class FloodError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FloodError';
  }
}

module.exports.FloodError = FloodError;

class UnsupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedError';
  }
}

module.exports.UnsupportedError = UnsupportedError;
