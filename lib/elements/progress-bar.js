'use strict';

var Marker = class {
  constructor(progressBar, percentage, delta, interval, callback) {
    this.progressBar = progressBar;
    this.percentage = percentage;
    this.delta = delta;
    this.interval = interval;
    this.callback = callback;
    this.pending = false;
    this.promise = null;
  }

  start() {
    this.pending = true;
    this.promise = new Promise((resolve, reject) => {
      var wrapResolve = () => {
        if (typeof (this.callback) === 'function') {
          this.callback();
        }
        resolve();
        this.pending = false;
      };
      this.progressBar.step(
        this.percentage, this.delta, this.interval, wrapResolve);
    });
    return this.promise;
  }
};

var ProgressBar = class {
  constructor(statuses, classes) {
    classes = classes || [];
    this.statuses = statuses;
    this.markers = [];
    this.timerID = null;

    this.element = document.createElement('div');
    this.element.classList.add('progress-bar');
    classes.forEach((c) => this.element.classList.add(c));

    this.status = document.createElement('div');
    this.status.classList.add('progress-bar-status');
    this.element.appendChild(this.status);

    this.progress = document.createElement('div');
    this.progress.classList.add('progress-bar-progress');
    this.element.appendChild(this.progress);

    this.percentage = 0;
    this.render();
  }

  destroy() {
    this.element.remove();
  }

  hide() {
    this.element.classList.add('hidden');
  }

  show() {
    this.element.classList.remove('hidden');
  }

  setStatuses(statuses) {
    this.statuses = statuses;
    this.render();
  }

  render() {
    if (this.percentage === 100) {
      this.progress.classList.add('finished');
      this.status.textContent = this.statuses.finished;
    } else {
      this.progress.classList.remove('finished');
      this.status.textContent = this.statuses.initial;
    }
    this.progress.style.width = this.percentage + '%';
  }

  increment(delta) {
    if (delta <= 0 || this.percentage >= 100) {
      return;
    }
    this.percentage = Math.min(100, this.percentage + delta);
    this.render();
  }

  addMarker(percentage, duration, interval, callback) {
    if (percentage <= 0 || percentage > 100) {
      return;
    }
    var last = this.markers.length ?
      this.markers[this.markers.length - 1] : undefined;
    if (last && last.percentage >= percentage) {
      return;
    }
    var prev = last ? last.percentage : 0;
    var delta = interval * (percentage - prev) / duration;
    var marker = new Marker(this, percentage, delta, interval, callback);

    var chain = (prev, next) => {
      if (prev.promise !== null) {
        prev.promise.then(() => next.start());
      } else {
        setTimeout(() => {
          chain(prev, next);
        }, 0);
      }
    };

    if (!last) {
      marker.start();
    } else {
      chain(last, marker);
    }
    this.markers.push(marker);
  }

  step(percentage, delta, interval, onFinish) {
    var move = () => {
      var incrementAndMove = () => {
        this.increment(delta);
        if (this.percentage < percentage) {
          move();
        } else {
          this.timerID = null;
          if (typeof (onFinish) === 'function') {
            onFinish();
          }
        }
      };
      this.timerID = setTimeout(() => {
        incrementAndMove();
      }, interval);
    };
    if (this.percentage < percentage) {
      move();
    }
  }

  reset() {
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
    this.markers.forEach((m) => {
      if (m.pending) {
        Promise.reject(m.prmoise);
      }
    });
    this.markers = this.markers.splice();
    this.percentage = 0;
    this.render();
  }
};

module.exports = ProgressBar;
