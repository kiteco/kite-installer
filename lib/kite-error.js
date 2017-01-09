module.exports = class KiteError extends Error {
  constructor(type, data) {
    super(type);
    this.name = this.constructor.name;
    this.message = type;
    this.type = type;
    this.data = data;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(type).stack;
    }
  }
};
