'use strict';

'use strict';

const Download = require('../../lib/install/download');
const StateController = require('../../lib/state-controller');
const {fakeKiteInstallPaths} = require('../spec-helpers');

describe('Download', () => {
  let step, promise;

  fakeKiteInstallPaths();

  describe('when the download succeeds', () => {
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
        waitsForPromise(() => promise.then(state => {
          expect(state.download.done).toBeTruthy();
        }));
      });
    });
  });

  describe('when the download fails', () => {
    beforeEach(() => {
      step = new Download();
      spyOn(StateController, 'downloadKiteRelease')
        .andCallFake(() => Promise.reject(new Error()));
    });

    describe('with a valid email', () => {
      beforeEach(() => {
        promise = step.start();
      });

      it('calls the download method', () => {
        expect(StateController.downloadKiteRelease).toHaveBeenCalled();
      });

      it('returns a promise that resolve when the request succeeds', () => {
        waitsForPromise({shouldReject: true}, () => promise);

        waitsForPromise(() => promise.catch(err => {
          expect(err.data.download.done).toBeFalsy();
        }));
      });
    });
  });
});
