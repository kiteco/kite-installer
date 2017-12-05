'use strict';

'use strict';

const Download = require('../../lib/install/download');
const StateController = require('../../lib/state-controller');
const {fakeKiteInstallPaths, startStep} = require('../spec-helpers');

describe('Download', () => {
  let step;

  fakeKiteInstallPaths();

  describe('when the download succeeds', () => {
    beforeEach(() => {
      step = new Download();
      spyOn(StateController, 'downloadKiteRelease').andCallFake(() => Promise.resolve());

      startStep(step);
    });

    it('calls the download method', () => {
      expect(StateController.downloadKiteRelease).toHaveBeenCalled();
    });
  });
});
