
'use strict';

const os = require('os');
const fs = require('fs');
const https = require('https');
const proc = require('child_process');
const StateController = require('../../lib/state-controller');
const WindowsSupport = require('../../lib/support/windows');

const {
  fakeKiteInstallPaths, fakeProcesses, fakeResponse,
  withKiteInstalled, withKiteRunning, withKiteNotRunning,
  withFakeServer,
} = require('../spec-helpers.js');

describe('StateController - Windows Support', () => {
  beforeEach(() => {
    spyOn(os, 'platform').andReturn('win32');
    spyOn(os, 'release').andReturn('6.1.3'); // NT6.1 = Windows 7
    spyOn(WindowsSupport, 'arch').andReturn('64bit'); // NT6.1 = Windows 7
  });

  fakeKiteInstallPaths();

  describe('.isKiteSupported()', () => {
    it('returns a resolved promise', () => {
      waitsForPromise(() => StateController.isKiteSupported());
    });

    describe('when the os release is below 6.1', () => {
      beforeEach(() => {
        os.release.andReturn('6.0.4'); // NT6.0 = Windows Vista
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteSupported());
      });
    });

    describe('when the arch is not 64bit', () => {
      beforeEach(() => {
        WindowsSupport.arch.andReturn('32bit');
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteSupported());
      });
    });
  });

  describe('.isKiteInstalled()', () => {
    withKiteInstalled(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.isKiteInstalled());
      });
    });

    describe('when there is no file at the given path', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true,
        }, () => StateController.isKiteInstalled());
      });
    });
  });

  describe('.installKite()', () => {
    describe('when every command succeeds', () => {
      beforeEach(() => {
        spyOn(fs, 'unlinkSync');
        fakeProcesses({
          exec: {
            [WindowsSupport.KITE_INSTALLER_PATH + ' --skip-onboarding']: () => 0,
          },
        });
      });

      it('returns a resolved promise', () => {
        const options = {
          onInstallStart: jasmine.createSpy(),
          onCopy: jasmine.createSpy(),
          onRemove: jasmine.createSpy(),
        };

        waitsForPromise(() => StateController.installKite(options));
        runs(() => {
          expect(proc.exec).toHaveBeenCalled();
          expect(fs.unlinkSync).toHaveBeenCalledWith(WindowsSupport.KITE_INSTALLER_PATH);

          expect(options.onInstallStart).toHaveBeenCalled();
          expect(options.onCopy).toHaveBeenCalled();
          expect(options.onRemove).toHaveBeenCalled();
        });
      });
    });

    describe('when installing the app fails', () => {
      beforeEach(() => {
        fakeProcesses({
          exec: {
            [WindowsSupport.KITE_INSTALLER_PATH + ' --skip-onboarding']: () => 1,
          },
        });
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite());
      });
    });

    describe('when removing the downloaded archive fails', () => {
      beforeEach(() => {
        spyOn(fs, 'unlinkSync').andCallFake(() => {
          throw new Error('unlink failed');
        });
        fakeProcesses({
          exec: {
            [WindowsSupport.KITE_INSTALLER_PATH + ' --skip-onboarding']: () => 0,
          },
        });
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite());
      });
    });
  });

  describe('.downloadKite()', () => {
    withFakeServer([
      [
        o => o === 'http://kite.com/download',
        o => fakeResponse(303, '', {headers: {location: 'https://download.kite.com'}}),
      ], [
        o => o === 'https://download.kite.com',
        o => fakeResponse(200, 'foo'),
      ],
    ], () => {
      describe('when the download succeeds', () => {
        beforeEach(() => {
          spyOn(fs, 'unlinkSync');
          fakeProcesses({
            exec: {
              [WindowsSupport.KITE_INSTALLER_PATH + ' --skip-onboarding']: () => 0,
            },
            del: () => 0,
          });
        });

        describe('with the install option', () => {
          it('returns a promise resolved after the install', () => {
            const options = {
              install: true,
              onDownload: jasmine.createSpy(),
              onInstallStart: jasmine.createSpy(),
              onCopy: jasmine.createSpy(),
              onRemove: jasmine.createSpy(),
            };
            const url = 'http://kite.com/download';

            waitsForPromise(() => StateController.downloadKite(url, options));
            runs(() => {
              expect(https.request).toHaveBeenCalledWith('http://kite.com/download');

              expect(proc.exec).toHaveBeenCalled();
              expect(fs.unlinkSync).toHaveBeenCalledWith(WindowsSupport.KITE_INSTALLER_PATH);

              expect(options.onInstallStart).toHaveBeenCalled();
              expect(options.onCopy).toHaveBeenCalled();
              expect(options.onRemove).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });

  describe('.isKiteRunning()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteRunning());
      });
    });

    withKiteInstalled(() => {
      describe('but not running', () => {
        beforeEach(() => {
          fakeProcesses({
            'tasklist': (ps) => {
              ps.stdout('');
              return 0;
            },
          });
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () => StateController.isKiteRunning());
        });
      });

      withKiteRunning(() => {
        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.isKiteRunning());
        });
      });
    });
  });

  describe('.canRunKite()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canRunKite());
      });
    });

    withKiteNotRunning(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.canRunKite());
      });
    });

    withKiteRunning(() => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canRunKite());
      });
    });
  });

  describe('.runKite()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.runKite());
      });
    });

    withKiteRunning(() => {
      it('returns a resolved function', () => {
        waitsForPromise(() => StateController.runKite());
      });
    });

    withKiteNotRunning(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.runKite());
        runs(() => {
          expect(proc.spawn.mostRecentCall.args[0]).toEqual(WindowsSupport.KITE_EXE_PATH);
        });
      });
    });
  });
});
