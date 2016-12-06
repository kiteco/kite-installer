const os = require('os')
const StateController = require('../lib/state-controller')

describe('StateController', () => {
  describe('.isKiteSupported()', () => {
    it('returns true for darwin platform', () => {
      waitsForPromise(() => StateController.isKiteSupported())
    })

    it('returns false for any other platform', () => {
      spyOn(os, 'platform').andReturn('linux')
      waitsForPromise({shouldReject: true}, () => StateController.isKiteSupported())
    })
  })

  describe('', () => {
    
  })
})
