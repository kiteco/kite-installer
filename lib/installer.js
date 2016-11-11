const child_process = require('child_process');

const AccountManager = require('./account-manager.js');
const StateController = require('./state-controller.js');
const utils = require('./utils.js');

var Installer = class {
  static get INTERVAL() {
    return 2000;
  }

  constructor() {
    this.flow = null;
    var paths = atom.project.getPaths();
    this.path = paths.length ? paths[0] : null;
  }

  init(flow) {
    this.flow = flow;
    this.flow.onInstall(this.install.bind(this));
    this.flow.onCreateAccount(this.createAccount.bind(this));
    this.flow.onLogin(this.login.bind(this));
    this.flow.onWhitelist(this.whitelist.bind(this));

    this.kiteCanRun = true;
    this.authTimerID = null;
    this.whitelistTimerID = null;

    this.installOpts = {
      deferWrite: true,
      onDownload: () => {
        this.flow.installStep.progress.addMarker(20, 1000, 10);
      },
      onWrite: () => {
        this.flow.installStep.progress.addMarker(30, 1000, 10);
      },
      onMount: () => {
        this.flow.installStep.progress.addMarker(40, 500, 10);
      },
      onCopy: () => {
        this.flow.installStep.progress.addMarker(60, 500, 10);
      },
      onUnmount: () => {
        this.flow.installStep.progress.addMarker(80, 500, 10);
      },
      onRemove: () => {
        this.flow.installStep.progress.addMarker(90, 500, 10);
      },
    };
  }

  get projectName() {
    if (!this.path) {
      return null;
    }
    var parts = this.path.split('/');
    return parts[parts.length - 1];
  }

  install() {
    this.flow.clickInstall(this.getUserEmail());
    StateController.installKiteRelease(this.installOpts).then(() => {
      console.log("waiting to install...");
    }, (err) => {
      console.error("error installing kite:", err);
    });
  }

  writeAndRun(callback) {
    StateController.writeDownloadedKite(this.installOpts).then(() => {
      StateController.runKite().then(() => {
        console.log("Kite running!");
        this.flow.installStep.progress.addMarker(100, 100, 10);
        typeof(callback) === 'function' && callback();
      }, (err) => {
        console.log("can't run Kite", err);
        this.kiteCanRun = false;
        this.flow.installStep.progress.addMarker(100, 100, 10);
      });
    }, (err) => {
      console.error("error writing kite:", err);
    });
  }

  createAccount() {
    try {
      var data = this.flow.createAccountStep.data;
      var req = AccountManager.createAccount(data, (resp) => {
        switch (resp.statusCode) {
        case 200:
          this.flow.accountValidated({
            email: this.flow.createAccountStep.data,
            path: this.projectName,
          });
          this.writeAndRun();
          break;
        case 409:
          this.flow.showLogin();
          break;
        default:
          this.flow.createAccountStep.showError("An error occurred");
          break;
        }
      });
    } catch (err) {
      console.log(`error creating account: ${ err.message }`);
    }
  }

  login() {
    var handle = (resp) => {
      switch (resp.statusCode) {
      case 200:
        this.flow.accountValidated({ path: this.projectName });
        this.writeAndRun(() => this.attemptAuthenticate());
        break;
      case 401:
        utils.handleResponseData(resp, (raw) => {
          try {
            var data = JSON.parse(raw);
            if (data.code === 9) {
              this.flow.loginStep.showError(
                "To login, set your password first");
            } else {
              this.flow.loginStep.showError(
                "Wrong email/password combination");
            }
          } catch (e) {
            this.flow.loginStep.showError("An error occurred");
          }
        });
        break;
      default:
        this.flow.loginStep.showError("An error occurred");
        break;
      }
    };

    try {
      var data = this.flow.loginStep.data;
      var req = AccountManager.login(data, handle);
    } catch (err) {
      console.log(`error logging in: ${ err.message }`);
    }
  }

  attemptAuthenticate() {
    var auth = () => {
      if (!this.kiteCanRun) {
        console.log("kite can't run - aborting authenticate");
        return;
      }
      var data = this.flow.loginStep.data;
      StateController.authenticateUser(data.email, data.password).then(() => {
        console.log("successfully authenticated!");
      }, (err) => {
        console.log("authenticate error:", err);
        this.attemptAuthenticate();
      });
    };

    console.log("attempting to authenticate...");
    this.authTimerID = setTimeout(() => {
      auth();
    }, this.INTERVAL);
  }

  whitelist() {
    var text = "Kite is still installing. " +
      "Give it a couple more seconds and you'll be ready to rock!";
    this.flow.whitelisted(text);
    this.attemptWhitelist();
  }

  attemptWhitelist() {
    var finish = () => {
      var text = "Kite is installed! " +
        "You can close this tab and start jamming some code!";
      this.flow.whitelistStep.setFinished(text);
      console.log("successfully whitelisted!");
    };

    var whitelist = () => {
      if (!this.kiteCanRun) {
        console.log("kite can't run - aborting whitelist");
        return;
      }
      if (!this.path) {
        console.log("no project paths - aborting whitelist");
        return;
      }
      StateController.whitelistPath(this.path).then(() => {
        finish();
      }, (err) => {
        if (err.type === 'bad_state' &&
            err.data === StateController.STATES.WHITELISTED) {
          finish();
          return;
        }
        console.log("whitelist error:", err);
        this.attemptWhitelist();
      });
    };

    console.log("attempting to whitelist...");
    this.whitelistTimerID = setTimeout(() => {
      whitelist();
    }, this.INTERVAL);
  }

  getUserEmail() {
    var proc = child_process.spawnSync('git', ['config', 'user.email'], {
      encoding: 'utf8',
    });
    return proc.stdout.trim();
  }
};

module.exports = Installer;
