const os = require('os')
const proc = require('child_process')
const StateController = require('../lib/state-controller')

const {fakeProcesses} = require('./spec-helpers.js')

describe('StateController', () => {
  let safePaths
  beforeEach(() => {
    safePaths = StateController.KITE_APP_PATH
    StateController.KITE_APP_PATH = { installed: '/path/to/Kite.app' }
  })

  afterEach(() => {
    StateController.KITE_APP_PATH = safePaths
  })

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
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: __filename }
      })

      it('returns a resolved promise', () => {
        waitsForPromise(() => StateController.isKiteInstalled())
      })
    })

    describe('when there is no file at the given path', () => {
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: '/path/to/file.app' }
      })

      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true
        }, () => StateController.isKiteInstalled())
      })
    })
  })

  describe('.canInstallKite()', () => {
    describe('when kite is installed', () => {
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: __filename }
      })

      it('returns a rejected promise', () => {
        waitsForPromise({
          shouldReject: true
        }, () => StateController.canInstallKite())
      })
    })

    describe('when kite is not installed', () => {
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: '/path/to/file.app' }
      })

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
        options = {
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
    beforeEach(() => {
      StateController.KITE_APP_PATH = { installed: '/path/to/Kite.app' }
    })

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
          options = {
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
          options = { onDownload: jasmine.createSpy() }
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
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: '/path/to/file.app' }
      })

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteRunning())
      })
    })

    describe('when kite is installed', () => {
      beforeEach(() => {
        StateController.KITE_APP_PATH = { installed: __filename }
      })

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
        beforeEach(() => {
          fakeProcesses({
            '/bin/ps': (ps) => {
              ps.stdout('Kite')
              return 0
            }
          })
        })

        it('returns a resolved promise', () => {
          waitsForPromise(() => StateController.isKiteRunning())
        })
      })
    })
  })
})
