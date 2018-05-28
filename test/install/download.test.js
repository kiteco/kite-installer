'use strict';

'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const KiteAPI = require('kite-api');

const Download = require('../../lib/install/download');
const {startStep} = require('../spec-helpers');

describe('Download', () => {
  let step;

  describe('when the download succeeds', () => {
    let stub;
    beforeEach(() => {
      step = new Download();
      stub = sinon.stub(KiteAPI, 'downloadKiteRelease').callsFake(() => Promise.resolve());

      startStep(step);
    });

    afterEach(() => {
      stub.restore();
    });

    it('calls the download method', () => {
      expect(KiteAPI.downloadKiteRelease.called).to.be.ok();
    });
  });
});
