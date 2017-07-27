'use strict';

'use strict';

const Download = require('../../lib/install/download');
const StateController = require('../../lib/state-controller');
const {fakeKiteInstallPaths} = require('../spec-helpers');

describe('Download', () => {
  let step, promise;

  fakeKiteInstallPaths();

  beforeEach(() => {
    step = new Download();
    spyOn(StateController, 'downloadKiteRelease')
    .andCallFake(() => Promise.resolve());
  });

  describe('with a valid email', () => {
    beforeEach(() => {
      promise = step.start();
    });

    it('calls the download method', () => {
      expect(StateController.downloadKiteRelease).toHaveBeenCalled();
    });

    it('returns a promise that resolve when the request succeeds', () => {
      waitsForPromise(() => promise);
    });
  });
});
