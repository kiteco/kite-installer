'use strict';

module.exports = class CompositeDisposable {
  constructor(disposables = []) {
    this.disposables = disposables;
  }

  add(disposable) {
    if (disposable && !this.disposables.includes(disposable)) {
      this.disposables.push(disposable);
    }
  }

  remove(disposable) {
    if (disposable && this.disposables.includes(disposable)) {
      this.disposables = this.disposables.filter(d => d != disposable);
    }
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
};
