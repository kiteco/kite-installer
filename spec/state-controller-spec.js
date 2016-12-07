const os = require('os')
const proc = require('child_process')
const StateController = require('../lib/state-controller')

const {fakeProcesses} = require('./spec-helpers.js')

describe('StateController', () => {
  describe('.isKiteSupported()', () => {
    it('returns a resolved promise for darwin platform', () => {
      waitsForPromise(() => StateController.isKiteSupported())
    })

    it('returns a rejected promise for any other platform', () => {
      spyOn(os, 'platform').andReturn('linux')
      waitsForPromise({
        shouldReject: true
      }, () => StateController.isKiteSupported())
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
        waitsForPromise(() => StateController.installKite())
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
          hdiutil: ([command]) => command === 'attach' ? 0 : 1,
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
})
