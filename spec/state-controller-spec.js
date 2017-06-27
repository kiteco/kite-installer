
'use strict';

const os = require('os');
const http = require('http');
const https = require('https');
const StateController = require('../lib/state-controller');

const {
  fakeRequestMethod, fakeKiteInstallPaths, fakeResponse,
  withKiteInstalled, withKiteRunning, withKiteNotRunning,
  withKiteReachable, withKiteNotReachable,
  withKiteNotAuthenticated, withKiteWhitelistedPaths,
  withRoutes, withFakeServer, withKiteEnterpriseRunning,
} = require('./spec-helpers.js');

describe('StateController', () => {
  fakeKiteInstallPaths();

  describe('.handleState()', () => {
    describe('for an unsupported platform', () => {
      beforeEach(() => {
        spyOn(os, 'platform').andReturn('linux');
      });

      it('returns a promise resolved with the corresponding state', () => {
        waitsForPromise(() => StateController.handleState().then(state => {
          expect(state).toEqual(StateController.STATES.UNSUPPORTED);
        }));
      });
    });

    describe('when kite is not installed', () => {
      it('returns a promise resolved with the corresponding state', () => {
        waitsForPromise(() => StateController.handleState().then(state => {
          expect(state).toEqual(StateController.STATES.UNINSTALLED);
        }));
      });
    });

    withKiteNotRunning(() => {
      it('returns a promise resolved with the corresponding state', () => {
        waitsForPromise(() => StateController.handleState().then(state => {
          expect(state).toEqual(StateController.STATES.INSTALLED);
        }));
      });
    });

    withKiteNotReachable(() => {
      it('returns a promise resolved with the corresponding state', () => {
        waitsForPromise(() => StateController.handleState().then(state => {
          expect(state).toEqual(StateController.STATES.RUNNING);
        }));
      });
    });

    withKiteNotAuthenticated(() => {
      it('returns a promise resolved with the corresponding state', () => {
        waitsForPromise(() => StateController.handleState().then(state => {
          expect(state).toEqual(StateController.STATES.REACHABLE);
        }));
      });
    });

    withKiteReachable([
      [o => o.path === '/clientapi/user', o => fakeResponse(500)],
    ], () => {
      describe('and an unexpected response from Kite', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.handleState());
        });
      });
    });
  });

  describe('.canInstallKite()', () => {
    withKiteInstalled(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true,
        }, () => StateController.canInstallKite());
      });
    });

    describe('when kite is not installed', () => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.canInstallKite());
      });
    });
  });

  describe('.downloadKiteRelease()', () => {
    beforeEach(() => {
      spyOn(StateController, 'downloadKite');
    });

    it('calls downloadKite with the release path of the current platform', () => {
      StateController.downloadKiteRelease();
      expect(StateController.downloadKite)
      .toHaveBeenCalledWith(StateController.releaseURL, {});
    });
  });

  describe('.downloadKite()', () => {
    withFakeServer([
      [
        o => /^http:\/\/kite\.com/.test(o) ||
             o === 'https://s3-us-west-1.amazonaws.com/kite-downloads/windows/KiteSetup.exe',
        o => fakeResponse(303, '', {headers: {location: 'https://download.kite.com'}}),
      ], [
        o => /^https:\/\/download\.kite\.com/.test(o),
        o => fakeResponse(200, 'foo'),
      ],
    ], () => {
      describe('when the download succeeds', () => {
        describe('without the install option', () => {
          beforeEach(() => {
            spyOn(StateController, 'installKite');
          });
          it('returns a resolved promise', () => {
            const options = { onDownload: jasmine.createSpy() };
            const url = 'http://kite.com/download';

            waitsForPromise(() => StateController.downloadKite(url, options));
            runs(() => {
              expect(https.request).toHaveBeenCalledWith('http://kite.com/download');
              expect(options.onDownload).toHaveBeenCalled();

              expect(StateController.installKite).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });

  describe('.isKiteReachable()', () => {
    withKiteNotRunning(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isKiteReachable());
      });
    });

    withKiteRunning(() => {
      describe('and is reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(true));
        });

        it('returns a resolving promise', () => {
          waitsForPromise(() => StateController.isKiteReachable());
        });
      });

      describe('and is not reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isKiteReachable());
        });
      });
    });

    withKiteEnterpriseRunning(() => {
      describe('and is reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(true));
        });

        it('returns a resolving promise', () => {
          waitsForPromise(() => StateController.isKiteReachable());
        });
      });

      describe('and is not reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isKiteReachable());
        });
      });
    });
  });

  describe('.waitForKite()', () => {
    withKiteRunning(() => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(true));
      });

      it('returns a resolving promise', () => {
        waitsForPromise(() => StateController.waitForKite(5, 0));
      });
    });

    withKiteNotRunning(() => {
      beforeEach(() => {
        spyOn(StateController, 'isKiteReachable').andCallThrough();
      });

      it('returns a promise that will be rejected after the specified number of attempts', () => {
        waitsForPromise({shouldReject: true}, () => StateController.waitForKite(5, 0));
        runs(() => {
          expect(StateController.isKiteReachable.callCount).toEqual(5);
        });
      });
    });
  });

  describe('.isUserAuthenticated()', () => {
    withKiteRunning(() => {
      describe('when the user is not authenticated', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(401)));
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isUserAuthenticated());
        });
      });

      describe('when the request ends with another status code', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(500)));
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isUserAuthenticated());
        });
      });

      xdescribe('when the request ends a 200 status code but the wrong data', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(200)));
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isUserAuthenticated());
        });
      });

      describe('when the user is authenticated', () => {
        beforeEach(() => {
          spyOn(http, 'request')
          .andCallFake(fakeRequestMethod(fakeResponse(200, 'authenticated')));
        });

        it('returns a resolving promise', () => {
          waitsForPromise(() => StateController.isUserAuthenticated());
        });
      });
    });
  });

  describe('.canAuthenticateUser()', () => {
    withKiteReachable(() => {
      it('returns a resolving promise', () => {
        waitsForPromise(() => StateController.canAuthenticateUser());
      });
    });

    withKiteNotReachable(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canAuthenticateUser());
      });
    });
  });

  describe('.authenticateUser()', () => {
    withKiteNotReachable(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canAuthenticateUser());
      });
    });

    withKiteReachable(() => {
      describe('and the authentication succeeds', () => {
        withRoutes([[
          o => /^\/api\/account\/login/.test(o.path),
          o => fakeResponse(200, 'authenticated'),
        ]]);

        it('returns a resolving promise', () => {
          waitsForPromise(() =>
            StateController.authenticateUser('email', 'password'));
        });
      });

      describe('and the authentication fails', () => {
        withRoutes([[
          o => /^\/api\/account\/login/.test(o.path),
          o => fakeResponse(401),
        ]]);

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.authenticateUser('email', 'password'));
        });
      });
    });
  });

  describe('.authenticateSessionID()', () => {
    withKiteNotReachable(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canAuthenticateUser());
      });
    });

    withKiteReachable(() => {
      describe('and the authentication succeeds', () => {
        withRoutes([[
          o => /^\/api\/account\/authenticate/.test(o.path),
          o => fakeResponse(200, 'authenticated'),
        ]]);

        it('returns a resolving promise', () => {
          waitsForPromise(() =>
            StateController.authenticateSessionID('key'));
        });
      });

      describe('and the authentication fails', () => {
        withRoutes([[
          o => /^\/api\/account\/authenticate/.test(o.path),
          o => fakeResponse(401),
        ]]);

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.authenticateSessionID('key'));
        });
      });
    });
  });

  describe('.isPathWhitelisted()', () => {
    withKiteNotAuthenticated(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isPathWhitelisted('/path/to/dir'));
      });
    });

    withKiteWhitelistedPaths(['/path/to/dir'], () => {
      describe('called without a path', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isPathWhitelisted());
        });
      });

      describe('passing a path not in the whitelist', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isPathWhitelisted('/path/to/other/dir'));
        });
      });

      describe('passing a path in the whitelist', () => {
        it('returns a resolving promise', () => {
          waitsForPromise(() =>
            StateController.isPathWhitelisted('/path/to/dir'));
        });
      });
    });
  });

  describe('.canWhitelistPath()', () => {
    withKiteNotAuthenticated(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.canWhitelistPath('/path/to/dir'));
      });
    });

    withKiteWhitelistedPaths(['/path/to/dir'], () => {
      describe('passing a path in the whitelist', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.canWhitelistPath('/path/to/dir'));
        });
      });

      describe('passing a path not in the whitelist', () => {
        it('returns a resolving promise', () => {
          waitsForPromise(() =>
            StateController.canWhitelistPath('/path/to/other/dir'));
        });
      });
    });
  });

  describe('.whitelistPath()', () => {
    withKiteNotAuthenticated(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.whitelistPath('/path/to/dir'));
      });
    });

    withKiteWhitelistedPaths(['/path/to/dir'], () => {
      describe('passing a path in the whitelist', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.whitelistPath('/path/to/dir'));
        });
      });

      describe('passing a path not in the whitelist', () => {
        describe('and the request succeeds', () => {
          withRoutes([[
            o =>
              /^\/clientapi\/permissions\/whitelist/.test(o.path) &&
              o.method === 'PUT',
            o => fakeResponse(200),
          ]]);

          it('returns a resolving promise', () => {
            waitsForPromise(() =>
            StateController.whitelistPath('/path/to/other/dir'));
          });
        });

        describe('and the request fails', () => {
          withRoutes([[
            o =>
              /^\/clientapi\/permissions\/whitelist/.test(o.path) &&
              o.method === 'PUT',
            o => fakeResponse(401),
          ]]);

          it('returns a rejected promise', () => {
            waitsForPromise({shouldReject: true}, () =>
            StateController.whitelistPath('/path/to/other/dir'));
          });
        });
      });
    });
  });

  describe('.blacklistPath()', () => {
    withKiteNotAuthenticated(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.blacklistPath('/path/to/dir'));
      });
    });

    withKiteWhitelistedPaths(['/path/to/dir'], () => {
      describe('passing a path in the whitelist', () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.blacklistPath('/path/to/dir'));
        });
      });

      describe('passing a path not in the whitelist', () => {
        describe('and the request succeeds', () => {
          withRoutes([[
            o =>
              /^\/clientapi\/permissions\/blacklist/.test(o.path) &&
              o.method === 'PUT',
            o => fakeResponse(200),
          ]]);

          it('returns a resolving promise', () => {
            waitsForPromise(() =>
            StateController.blacklistPath('/path/to/other/dir'));
          });
        });

        describe('and the request fails', () => {
          withRoutes([[
            o =>
              /^\/clientapi\/settings\/inclusions/.test(o.path) &&
              o.method === 'PUT',
            o => fakeResponse(401),
          ]]);

          it('returns a rejected promise', () => {
            waitsForPromise({shouldReject: true}, () =>
            StateController.blacklistPath('/path/to/other/dir'));
          });
        });
      });
    });
  });
});
