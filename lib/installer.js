'use strict';

var child_process = require('child_process');
var fs = require('fs');
var os = require('os');
var path = require('path');

var AccountManager = require('./account-manager');
var AtomHelper = require('./atom-helper');
var StateController = require('./state-controller');
var utils = require('./utils');
const Logger = require('./logger');

var Tracker = require('../ext/telemetry/metrics').Tracker;

var Installer = class {
  static get INTERVAL() {
    return 2500;
  }

  constructor(paths) {
    paths = paths || [];
    this.flow = null;
    this.path = paths.length ? paths[0] : os.homedir();
  }

  instrument(fn) {
    this.flow.disable();
    fn.call(this)
    .then(() => this.flow.enable())
    .catch(() => this.flow.enable());
  }

  init(flow, onFinish) {
    this.flow = flow;
    this.flow.onInstall(() => this.instrument(this.install));
    this.flow.onCreateAccount(() => this.instrument(this.createAccount));
    this.flow.onLogin(() => this.instrument(this.login));
    this.flow.onResetPassword(() => this.instrument(this.resetPassword));
    this.flow.onLoginBack(() => this.flow.showCreateAccount());
    this.flow.onWhitelist(() => this.instrument(this.whitelist));
    this.flow.onSkipWhitelist(() => this.instrument(this.skipWhitelist));

    this.parsedEmail = null;
    this.kiteCanRun = true;
    this.installPromise = null;
    this.authTimerID = null;
    this.whitelistTimerID = null;
    this.onFinish = onFinish || null;

    this.opts = {
      install: false,
    };

    this.parseUserEmail();
    Tracker.trackEvent('start flow');
  }

  get projectName() {
    if (!this.path) {
      return null;
    }
    var parts = this.path.split('/');
    return parts[parts.length - 1];
  }

  install() {
    Tracker.trackEvent('enabled kite');
    this.flow.showCreateAccount(this.parsedEmail);
    this.installPromise = StateController.downloadKiteRelease(this.opts);
    return this.installPromise.catch((err) => {
      Tracker.trackEvent('error downloading to memory', { error: err });
      Logger.error('error installing kite:', err);
    });
  }

  installAndRun(callback) {
    Tracker.trackEvent('saving to disk');
    return (this.installPromise || StateController.downloadKiteRelease(this.opts))
    .then(() => {
      StateController.installKite(this.opts).then(() => {
        Tracker.trackEvent('installed successfully');
        StateController.runKiteAndWait(30, Installer.INTERVAL).then(() => {
          Tracker.trackEvent('app started successfully');
          if (typeof callback === 'function') {
            callback();
          }
        }, (err) => {
          Tracker.trackEvent('error running kite', { error: err });
          Logger.error('error running kite:', err);
          this.kiteCanRun = false;
        });
      }, (err) => {
        Tracker.trackEvent('error saving kite', { error: err });
        Logger.error('error saving kite:', err);
      });
    });
  }

  createAccount() {
    Tracker.trackEvent('creating account');
    try {
      var data = this.flow.createAccountStep.data;
      return AccountManager.createAccount(data, (resp) => {
        Tracker.trackEvent('attempt to create account');
        switch (resp.statusCode) {
          case 200:
            utils.handleResponseData(resp, (raw) => {
              var info = JSON.parse(raw);
              Tracker.props.distinct_id = info.id;
              Tracker.trackEvent('account created');
            });
            if (typeof this.onAuthenticate === 'function') {
              this.onAuthenticate();
            }
            this.flow.showWhitelist({
              email: data.email,
              path: this.path,
            });
            this.installAndRun(() => this.attemptAuthenticate());
            break;
          case 409:
            Tracker.trackEvent('email exists showing login');
            this.flow.showLogin();
            break;
          default:
            Tracker.trackEvent('create account error', { code: resp.statusCode });
            this.flow.createAccountStep.showError('An error occurred');
            break;
        }
      });
    } catch (err) {
      Tracker.trackEvent('error creating account', { error: err.message });
      Logger.error('error creating account:', err);
      return Promise.reject();
    }
  }

  login() {
    Tracker.trackEvent('logging in');
    var handleUnauthorized = (resp) => {
      try {
        var data = JSON.parse(resp);
        if (data.code === 9) {
          Tracker.trackEvent('user needs to set password');
          this.flow.loginStep.showError('To login, set your password first');
        } else {
          Tracker.trackEvent('incorrect credentials');
          this.flow.loginStep.showError('Wrong email/password combination');
        }
      } catch (e) {
        Tracker.trackEvent('error handling unauthorized user');
        this.flow.loginStep.showError('An error occurred');
      }
    };
    try {
      var data = this.flow.loginStep.data;
      return AccountManager.login(data, (resp) => {
        switch (resp.statusCode) {
          case 200:
            utils.handleResponseData(resp, (raw) => {
              var info = JSON.parse(raw);
              Tracker.props.distinct_id = info.id;
              Tracker.trackEvent('login successful');
            });
            if (typeof this.onAuthenticate === 'function') {
              this.onAuthenticate();
            }
            this.flow.showWhitelist({ path: this.path });
            this.installAndRun(() => this.attemptAuthenticate());
            break;
          case 400:
          case 401:
            Tracker.trackEvent('unauthorized login');
            utils.handleResponseData(resp, (raw) => handleUnauthorized(raw));
            break;
          default:
            Tracker.trackEvent('login error', { code: resp.statusCode });
            this.flow.loginStep.showError('An error occurred');
            break;
        }
      });
    } catch (err) {
      Tracker.trackEvent('error logging in', { error: err.message });
      Logger.error('error logging in:', err);
      return Promise.reject();
    }
  }

  resetPassword() {
    Tracker.trackEvent('resetting password');
    try {
      var data = this.flow.loginStep.data;
      return AccountManager.resetPassword(data, (resp) => {
        switch (resp.statusCode) {
          case 200:
            Tracker.trackEvent('sent password reset');
            var msg = "We've sent you an email with instructions " +
            'to reset your password.';
            this.flow.loginStep.showStatus(msg);
            break;
          default:
            Tracker.trackEvent('reset error', { code: resp.statusCode });
            this.flow.loginStep.showError('An error occurred');
            break;
        }
      });
    } catch (err) {
      Tracker.trackEvent('error resetting password', { error: err });
      Logger.error('error resetting password:', err);
      return Promise.reject();
    }
  }

  attemptAuthenticate() {
    Tracker.trackEvent('attempting to authenticate');
    var auth = () => {
      if (!this.kiteCanRun) {
        Tracker.trackEvent("kite can't run - aborting authenticate");
        Logger.error("kite can't run - aborting authenticate");
        return;
      }
      var sessionKey = AccountManager.client.cookies['kite-session'];
      StateController.authenticateSessionID(sessionKey.Value).catch((err) => {
        Tracker.trackEvent('error authenticating', { error: err });
        Logger.error('error authenticating:', err);
        this.attemptAuthenticate();
      });
    };
    this.authTimerID = setTimeout(() => {
      auth();
    }, Installer.INTERVAL);
  }

  whitelist() {
    Tracker.trackEvent('whitelisting');
    this.flow.finishWhitelist();
    return StateController.waitForKite(30, Installer.INTERVAL).then(() => {
      this.attemptWhitelist();
    }, (err) => {
      Tracker.trackEvent('error waiting to whitelisting', { error: err });
      Logger.error('error waiting to whitelist:', err);
      this.finish();
    });
  }

  attemptWhitelist() {
    Tracker.trackEvent('attempting to whitelist');
    var whitelist = () => {
      if (!this.kiteCanRun) {
        Tracker.trackEvent("kite can't run - aborting whitelist");
        Logger.error("kite can't run - aborting whitelist");
        return;
      }
      if (!this.path) {
        Tracker.trackEvent('no path to whitelist');
        return;
      }
      StateController.whitelistPath(this.path).then(() => {
        this.finish();
      }, (err) => {
        if (err.type === 'bad_state' &&
            err.data === StateController.STATES.WHITELISTED) {
          this.finish();
          return;
        }
        Tracker.trackEvent('error whitelisting', { error: err });
        Logger.error('error whitelisting:', err);
        this.attemptWhitelist();
      });
    };
    this.whitelistTimerID = setTimeout(() => {
      whitelist();
    }, Installer.INTERVAL);
  }

  skipWhitelist() {
    Tracker.trackEvent('skipped whitelist');
    this.flow.finishWhitelist();
    return StateController.waitForKite(30, Installer.INTERVAL).then(() => {
      this.finish();
    }, (err) => {
      Tracker.trackEvent('error waiting to whitelist:', { error: err });
      Logger.error('error waiting to whitelist:', err);
      this.finish();
    });
  }

  finish() {
    var endProgress = () => {
      this.flow.finishFlow();
      if (typeof this.onFinish === 'function') {
        this.onFinish();
      }
    };
    var prom = AtomHelper.installPackage();
    if (!prom) {
      Tracker.trackEvent('no kite.js - finishing flow');
      endProgress();
    } else {
      prom.then(() => {
        Tracker.trackEvent('installing kite.js and finishing');
        endProgress();
      }, (err) => {
        Tracker.trackEvent('error installing kite.js - finishing', { error: err });
        Logger.error('error refreshing Atom package:', err);
        endProgress();
      });
    }
  }

  getUserEmail() {
    var proc = child_process.spawnSync('git', ['config', 'user.email'], {
      encoding: 'utf8',
    });
    return proc.stdout.trim();
  }

  parseUserEmail() {
    try {
      this.parsedEmail = null;
      var cfg = fs.readFileSync(path.join(os.homedir(), '.gitconfig')).toString();
      var lines = cfg.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var items = lines[i].trim().split('=');
        if (items[0].trim() === 'email') {
          this.parsedEmail = items[1].trim();
          break;
        }
      }
    } catch (err) {
      Tracker.trackEvent('error parsing gitconfig', { error: err.message });
      Logger.error('error parsing gitconfig:', err);
    }
  }
};

module.exports = Installer;
