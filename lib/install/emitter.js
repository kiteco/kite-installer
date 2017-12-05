'use strict';

module.exports = class Emitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    this.listeners[event] = this.listeners[event] || [];

    if (listener && !this.listeners[event].includes(listener)) {
      this.listeners[event].push(listener);
      return {
        dispose: () => {
          this.listeners[event] = this.listeners[event].filter(l => l !== listener);
        },
      };
    } else {
      return {
        dispose: () => {},
      };
    }
  }

  emit(event, data) {
    this.listeners[event] && this.listeners[event].forEach(listener => {
      listener(data);
    });
  }
};
