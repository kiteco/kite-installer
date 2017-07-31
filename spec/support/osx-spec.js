
'use strict';

const os = require('os');
const https = require('https');
const proc = require('child_process');
const StateController = require('../../lib/state-controller');
const OSXSupport = require('../../lib/support/osx');

const {
  fakeProcesses, fakeKiteInstallPaths, fakeResponse,
  withKiteInstalled, withKiteRunning, withKiteNotRunning,
  withFakeServer, withKiteEnterpriseInstalled, withBothKiteInstalled,
  withKiteEnterpriseRunning, withKiteEnterpriseNotRunning,
} = require('../spec-helpers.js');

describe('StateController - OSX Support', () => {
  beforeEach(() => {
    spyOn(os, 'platform').andReturn('darwin');
    spyOn(os, 'release').andReturn('14.0.0');
  });

  fakeKiteInstallPaths();

  describe('.isKiteSupported()', () => {
    it('returns a resolved promise', () => {
      waitsForPromise(() => StateController.isKiteSupported());
    });

    describe('when the os release is below 10.10', () => {
      beforeEach(() => {
        os.release.andReturn('13.0.0');
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

    describe('when kite is not installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true,
        }, () => StateController.isKiteInstalled());
      });
    });

    withKiteEnterpriseInstalled(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isKiteInstalled());
      });
    });
  });

  describe('.isKiteEnterpriseInstalled()', () => {
    describe('when kite enterprise is not installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isKiteEnterpriseInstalled());
      });
    });

    withKiteInstalled(() => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isKiteEnterpriseInstalled());
      });
    });

    withKiteEnterpriseInstalled(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.isKiteEnterpriseInstalled());
      });
    });
  });

  describe('.hasBothKiteInstalled()', () => {
    describe('when no kite is installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
        StateController.hasBothKiteInstalled());
      });
    });

    describe('when kite enterprise is not installed', () => {
      withKiteInstalled(() => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
          StateController.hasBothKiteInstalled());
        });
      });
    });

    describe('when kite is not installed', () => {
      withKiteEnterpriseInstalled(() => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
          StateController.hasBothKiteInstalled());
        });
      });
    });

    withBothKiteInstalled(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.hasBothKiteInstalled());
      });
    });
  });

  describe('.installKite()', () => {
    describe('when every command succeeds', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 0,
          rm: () => 0,
          mdfind: (ps, args) => {
            const [, key] = args[0].split(/\s=\s/);
            key === '"com.kite.Kite"'
              ? ps.stdout('/Applications/Kite.app')
              : ps.stdout('');
            return 0;
          },
        });
      });

      it('returns a resolved promise', () => {
        const options = {
          onInstallStart: jasmine.createSpy(),
          onMount: jasmine.createSpy(),
          onCopy: jasmine.createSpy(),
          onUnmount: jasmine.createSpy(),
          onRemove: jasmine.createSpy(),
        };

        waitsForPromise(() => StateController.installKite(options));
        runs(() => {
          expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
            'attach', '-nobrowse',
            OSXSupport.KITE_DMG_PATH,
          ]);
          expect(proc.spawn).toHaveBeenCalledWith('cp', [
            '-r',
            OSXSupport.KITE_APP_PATH.mounted,
            OSXSupport.APPS_PATH,
          ]);
          expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
            'detach',
            OSXSupport.KITE_VOLUME_PATH,
          ]);
          expect(proc.spawn).toHaveBeenCalledWith('rm', [
            OSXSupport.KITE_DMG_PATH,
          ]);
          expect(proc.spawn).toHaveBeenCalledWith('mdfind', [
            'kMDItemCFBundleIdentifier = "com.kite.Kite"',
          ]);

          expect(options.onInstallStart).toHaveBeenCalled();
          expect(options.onMount).toHaveBeenCalled();
          expect(options.onCopy).toHaveBeenCalled();
          expect(options.onUnmount).toHaveBeenCalled();
          expect(options.onRemove).toHaveBeenCalled();
        });
      });
    });

    describe('when mounting the archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 1,
          cp: () => 0,
          rm: () => 0,
        });
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite());
      });
    });

    describe('when copying the archive content fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 1,
          rm: () => 0,
        });
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite());
      });
    });

    describe('when unmounting the archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: (ps, [command]) => command === 'attach' ? 0 : 1,
          cp: () => 0,
          rm: () => 0,
        });
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite());
      });
    });

    describe('when removing the downloaded archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 0,
          rm: () => 1,
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
        o => /^http:\/\/kite\.com/.test(o),
        o => fakeResponse(303, '', {headers: {location: 'https://download.kite.com'}}),
      ], [
        o => /^https:\/\/download\.kite\.com/.test(o),
        o => fakeResponse(200, 'foo'),
      ],
    ], () => {
      describe('when the download succeeds', () => {
        beforeEach(() => {
          fakeProcesses({
            hdiutil: () => 0,
            cp: () => 0,
            rm: () => 0,
            mdfind: (ps) => {
              ps.stdout('');
              return 0;
            },
          });
        });

        describe('with the install option', () => {
          it('returns a promise resolved after the install', () => {
            const options = {
              install: true,
              onDownload: jasmine.createSpy(),
              onInstallStart: jasmine.createSpy(),
              onMount: jasmine.createSpy(),
              onCopy: jasmine.createSpy(),
              onUnmount: jasmine.createSpy(),
              onRemove: jasmine.createSpy().andCallFake(() => {
                fakeProcesses({
                  mdfind: (ps, args) => {
                    const [, key] = args[0].split(/\s=\s/);
                    key === '"com.kite.Kite"'
                      ? ps.stdout('/Applications/Kite.app')
                      : ps.stdout('');
                    return 0;
                  },
                });
              }),
            };
           const url = 'http://kite.com/download';

            waitsForPromise(() => StateController.downloadKite(url, options));
            runs(() => {
              expect(https.request).toHaveBeenCalledWith('http://kite.com/download');
              expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
                'attach', '-nobrowse',
                OSXSupport.KITE_DMG_PATH,
              ]);
              expect(proc.spawn).toHaveBeenCalledWith('cp', [
                '-r',
                OSXSupport.KITE_APP_PATH.mounted,
                OSXSupport.APPS_PATH,
              ]);
              expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
                'detach',
                OSXSupport.KITE_VOLUME_PATH,
              ]);
              expect(proc.spawn).toHaveBeenCalledWith('rm', [
                OSXSupport.KITE_DMG_PATH,
              ]);

              expect(options.onDownload).toHaveBeenCalled();
              expect(options.onInstallStart).toHaveBeenCalled();
              expect(options.onMount).toHaveBeenCalled();
              expect(options.onCopy).toHaveBeenCalled();
              expect(options.onUnmount).toHaveBeenCalled();
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
            '/bin/ps': (ps) => {
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
          expect(proc.spawn).toHaveBeenCalledWith('defaults', [
            'write', 'com.kite.Kite', 'shouldReopenSidebar', '0',
          ]);

          expect(proc.spawn).toHaveBeenCalledWith('open', [
            '-a', OSXSupport.installPath,
          ]);
        });
      });
    });
  });

  describe('.isKiteEnterpriseRunning()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteEnterpriseRunning());
      });
    });

    withKiteEnterpriseInstalled(() => {
      describe('but not running', () => {
        beforeEach(() => {
          fakeProcesses({
            '/bin/ps': (ps) => {
              ps.stdout('');
              return 0;
            },
          });
        });

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () => StateController.isKiteEnterpriseRunning());
        });
      });

      withKiteEnterpriseRunning(() => {
        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.isKiteEnterpriseRunning());
        });
      });
    });
  });

  describe('.canRunKiteEnterprise()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canRunKiteEnterprise());
      });
    });

    withKiteEnterpriseNotRunning(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.canRunKiteEnterprise());
      });
    });

    withKiteEnterpriseRunning(() => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canRunKiteEnterprise());
      });
    });
  });

  describe('.runKiteEnterprise()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.runKiteEnterprise());
      });
    });

    withKiteEnterpriseRunning(() => {
      it('returns a resolved function', () => {
        waitsForPromise(() => StateController.runKiteEnterprise());
      });
    });

    withKiteEnterpriseNotRunning(() => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.runKiteEnterprise());
        runs(() => {
          expect(proc.spawn).toHaveBeenCalledWith('defaults', [
            'write', 'enterprise.kite.Kite', 'shouldReopenSidebar', '0',
          ]);

          expect(proc.spawn).toHaveBeenCalledWith('open', [
            '-a', OSXSupport.enterpriseInstallPath,
          ]);
        });
      });
    });
  });
});
