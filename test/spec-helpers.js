
const AccountManager = require('../lib/account-manager');
const Install = require('../lib/install');
// const InstallElement = require('../lib/elements/atom/install-element');
const TestClient = require('kite-connector/lib/clients/test-client');

function startStep(step, state) {
  const install = new Install([step], state);
  // const element = new InstallElement();
  // element.setModel(install);
  const promise = install.start();
  promise.install = install;
  return promise;
}

function sleep(duration) {
  const t = new Date();
  waitsFor(`${duration}ms`, () => { return new Date() - t > duration; });
}

function withAccountServer(routes = [], block) {
  let safeClient;
  beforeEach(() => {
    safeClient = AccountManager.client;
    AccountManager.client = new TestClient();
    routes.forEach(route => AccountManager.client.addRoute(route));
  });

  afterEach(() => {
    AccountManager.client = safeClient;
  });

  if (block) {
    describe('', () => {
      beforeEach(() => {
        routes.forEach(route => AccountManager.client.addRoute(route));
      });
      block();
    });
  } else {
    beforeEach(() => {
      routes.forEach(route => AccountManager.client.addRoute(route));
    });
  }
}

function withAccountRoutes(routes) {
  beforeEach(function() {
    routes.reverse().forEach(route => AccountManager.client.addRoute(route));
  });
}

module.exports = {
  withAccountServer, withAccountRoutes, sleep, startStep,
};
