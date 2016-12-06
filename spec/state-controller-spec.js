const os = require('os')
const StateController = require('../lib/state-controller')

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
})
