'use strict'

const os = require('os')
const http = require('http')
const proc = require('child_process')
const StateController = require('../lib/state-controller')

const {fakeProcesses, fakeRequestMethod, fakeKiteInstallPaths, fakeResponse, withKiteInstalled, withKiteRunning, withKiteNotRunning, withKiteReachable, withKiteNotReachable} = require('./spec-helpers.js')

describe('StateController', () => {
  fakeKiteInstallPaths()

  describe('.isKiteSupported()', () => {
    it('returns a resolved promise for darwin platform', () => {
      waitsForPromise(() => StateController.isKiteSupported())
    })

    describe('for another platform', () => {
      beforeEach(() => {
        spyOn(os, 'platform').andReturn('linux')
      })

      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true
        }, () => StateController.isKiteSupported())
      })
    })
  })

  describe('.isKiteInstalled()', () => {
    describe('when a file exist at the given path', () => {
      withKiteInstalled()

      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.isKiteInstalled())
      })
    })

    describe('when there is no file at the given path', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true
        }, () => StateController.isKiteInstalled())
      })
    })
  })

  describe('.canInstallKite()', () => {
    describe('when kite is installed', () => {
      withKiteInstalled()

      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true
        }, () => StateController.canInstallKite())
      })
    })

    describe('when kite is not installed', () => {
      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.canInstallKite())
      })
    })
  })

  describe('.installKite()', () => {
    describe('when every command succeeds', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 0,
          rm: () => 0,
        })
      })

      it('returns a resolved promise', () => {
        const options = {
          onInstallStart: jasmine.createSpy(),
          onMount: jasmine.createSpy(),
          onCopy: jasmine.createSpy(),
          onUnmount: jasmine.createSpy(),
          onRemove: jasmine.createSpy(),
        }

        waitsForPromise(() => StateController.installKite(options))
        runs(() => {
          expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
            'attach', '-nobrowse',
            StateController.KITE_DMG_PATH
          ])
          expect(proc.spawn).toHaveBeenCalledWith('cp', [
            '-r',
            StateController.KITE_APP_PATH.mounted,
            StateController.APPS_PATH
          ])
          expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
            'detach',
            StateController.KITE_VOLUME_PATH
          ])
          expect(proc.spawn).toHaveBeenCalledWith('rm', [
            StateController.KITE_DMG_PATH
          ])

          expect(options.onInstallStart).toHaveBeenCalled()
          expect(options.onMount).toHaveBeenCalled()
          expect(options.onCopy).toHaveBeenCalled()
          expect(options.onUnmount).toHaveBeenCalled()
          expect(options.onRemove).toHaveBeenCalled()
        })
      })
    })

    describe('when mounting the archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 1,
          cp: () => 0,
          rm: () => 0,
        })
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite())
      })
    })

    describe('when copying the archive content fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 1,
          rm: () => 0,
        })
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite())
      })
    })

    describe('when unmounting the archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: (ps, [command]) => command === 'attach' ? 0 : 1,
          cp: () => 0,
          rm: () => 0,
        })
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite())
      })
    })

    describe('when removing the downloaded archive fails', () => {
      beforeEach(() => {
        fakeProcesses({
          hdiutil: () => 0,
          cp: () => 0,
          rm: () => 1,
        })
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.installKite())
      })
    })
  })

  describe('.downloadKite()', () => {
    describe('when the curl command succeeds', () => {
      beforeEach(() => {
        fakeProcesses({
          curl: () => 0,
          hdiutil: () => 0,
          cp: () => 0,
          rm: () => 0,
        })
      })

      describe('with the install option', () => {
        it('returns a promise resolved after the install', () => {
          const options = {
            install: true,
            onDownload: jasmine.createSpy(),
            onInstallStart: jasmine.createSpy(),
            onMount: jasmine.createSpy(),
            onCopy: jasmine.createSpy(),
            onUnmount: jasmine.createSpy(),
            onRemove: jasmine.createSpy(),
          }
          const url = 'http://kite.com/download'

          waitsForPromise(() => StateController.downloadKite(url, options))
          runs(() => {
            expect(proc.spawn).toHaveBeenCalledWith('curl', [
              '-L', url,
              '--output', StateController.KITE_DMG_PATH
            ])
            expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
              'attach', '-nobrowse',
              StateController.KITE_DMG_PATH
            ])
            expect(proc.spawn).toHaveBeenCalledWith('cp', [
              '-r',
              StateController.KITE_APP_PATH.mounted,
              StateController.APPS_PATH
            ])
            expect(proc.spawn).toHaveBeenCalledWith('hdiutil', [
              'detach',
              StateController.KITE_VOLUME_PATH
            ])
            expect(proc.spawn).toHaveBeenCalledWith('rm', [
              StateController.KITE_DMG_PATH
            ])

            expect(options.onDownload).toHaveBeenCalled()
            expect(options.onInstallStart).toHaveBeenCalled()
            expect(options.onMount).toHaveBeenCalled()
            expect(options.onCopy).toHaveBeenCalled()
            expect(options.onUnmount).toHaveBeenCalled()
            expect(options.onRemove).toHaveBeenCalled()
          })
        })
      })

      describe('without the install option', () => {
        beforeEach(() => {
          spyOn(StateController, 'installKite')
        })
        it('returns a resolved promise', () => {
          const options = { onDownload: jasmine.createSpy() }
          const url = 'http://kite.com/download'

          waitsForPromise(() => StateController.downloadKite(url, options))
          runs(() => {
            expect(proc.spawn).toHaveBeenCalledWith('curl', [
              '-L', url,
              '--output', StateController.KITE_DMG_PATH
            ])
            expect(options.onDownload).toHaveBeenCalled()

            expect(StateController.installKite).not.toHaveBeenCalled()
          })
        })
      })
    })
  })

  describe('.isKiteRunning()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteRunning())
      })
    })

    describe('when kite is installed', () => {
      withKiteInstalled()

      describe('but not running', () => {
        beforeEach(() => {
          fakeProcesses({
            '/bin/ps': (ps) => {
              ps.stdout('')
              return 0
            }
          })
        })

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () => StateController.isKiteRunning())
        })
      })

      describe('and running', () => {
        withKiteRunning()

        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.isKiteRunning())
        })
      })
    })
  })

  describe('.canRunKite()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canRunKite())
      })
    })

    describe('when kite is installed', () => {
      withKiteInstalled()

      describe('but not running', () => {
        beforeEach(() => {
          fakeProcesses({
            '/bin/ps': (ps) => {
              ps.stdout('')
              return 0
            }
          })
        })

        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.canRunKite())
        })
      })

      describe('and running', () => {
        withKiteRunning()

        it('returns a rejected function', () => {
          waitsForPromise({shouldReject: true}, () => StateController.canRunKite())
        })
      })
    })
  })

  describe('.runKite()', () => {
    describe('when kite is not installed', () => {
      it('returns a rejected function', () => {
        waitsForPromise({shouldReject: true}, () => StateController.runKite())
      })
    })

    describe('when kite is installed', () => {
      withKiteInstalled()

      describe('and running', () => {
        withKiteRunning()

        it('returns a rejected function', () => {
          waitsForPromise({shouldReject: true}, () => StateController.runKite())
        })
      })

      describe('but not running', () => {
        withKiteNotRunning()

        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.runKite())
          runs(() => {
            expect(proc.spawn).toHaveBeenCalledWith('defaults', [
              'write', 'com.kite.Kite', 'shouldReopenSidebar', '0'
            ])

            expect(proc.spawn).toHaveBeenCalledWith('open', [
              '-a', StateController.KITE_APP_PATH.installed
            ])
          })
        })
      })
    })
  })

  describe('.isKiteReachable()', () => {
    withKiteInstalled()

    describe('when kite is not running', () => {
      withKiteNotRunning()

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isKiteReachable())
      })
    })

    describe('when kite is running', () => {
      withKiteRunning()

      describe('and is reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(true))
        })

        it('returns a resolving promise', () => {
          waitsForPromise(() => StateController.isKiteReachable())
        })
      })

      describe('and is not reachable', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(false))
        })

        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.isKiteReachable())
        })
      })
    })
  })

  describe('.waitForKite()', () => {
    describe('when kite is running and reachable', () => {
      withKiteRunning()

      beforeEach(() => {
        jasmine.useRealClock()
        spyOn(http, 'request').andCallFake(fakeRequestMethod(true))
      })

      it('returns a resolving promise', () => {
        waitsForPromise(() => StateController.waitForKite(5, 0))
      })
    })

    describe('when kite is not reachable', () => {
      withKiteNotRunning()

      beforeEach(() => {
        jasmine.useRealClock()
        spyOn(StateController, 'isKiteReachable').andCallThrough()
      })

      it('returns a promise that will be rejected after the specified number of attempts', () => {
        waitsForPromise({shouldReject: true}, () => StateController.waitForKite(5, 0))
        runs(() => {
          expect(StateController.isKiteReachable.callCount).toEqual(5)
        })
      })
    })
  })


  describe('.isUserAuthenticated()', () => {
    withKiteRunning()

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(401)))
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isUserAuthenticated())
      })
    })

    describe('when the request ends with another status code', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(500)))
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isUserAuthenticated())
      })
    })

    describe('when the request ends a 200 status code but the wrong data', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(fakeResponse(200)))
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          StateController.isUserAuthenticated())
      })
    })

    describe('when the user is authenticated', () => {
      beforeEach(() => {
        spyOn(http, 'request')
        .andCallFake(fakeRequestMethod(fakeResponse(200, 'authenticated')))
      })

      it('returns a resolving promise', () => {
        waitsForPromise(() => StateController.isUserAuthenticated())
      })
    })
  })

  describe('.canAuthenticateUser()', () => {
    describe('when kite is reachable', () => {
      withKiteReachable()

      it('returns a resolving promise', () => {
        waitsForPromise(() => StateController.canAuthenticateUser())
      })
    })

    describe('when kite is not reachable', () => {
      withKiteNotReachable()

      it('returns a resolving promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canAuthenticateUser())
      })
    })
  })

  describe('.authenticateUser()', () => {
    describe('when kite is not reachable', () => {
      withKiteNotReachable()

      it('returns a resolving promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.canAuthenticateUser())
      })
    })

    describe('when kite is reachable', () => {
      withKiteRunning()

      describe('and the authentication succeeds', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(true))
        })

        it('returns a resolving promise', () => {
          waitsForPromise(() =>
            StateController.authenticateUser('email', 'password'))
        })
      })

      describe('and the authentication fails', () => {
        beforeEach(() => {
          spyOn(http, 'request')
          .andCallFake(fakeRequestMethod(fakeResponse(401)))
        })

        it('returns a resolving promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            StateController.authenticateUser('email', 'password'))
        })
      })
    })
  })
})
