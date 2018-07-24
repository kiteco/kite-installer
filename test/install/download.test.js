'use strict';

'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const KiteAPI = require('kite-api');
const {waitsFor, waitsForPromise} = require('kite-connector/test/helpers/async');

const Download = require('../../lib/install/download');
const {startStep} = require('../spec-helpers');

describe('Download', () => {
  let step, install, promise;
  let spyUpdateState, stubDownload, stubInstall, stubIsInstalled, stubRun;
  let completeDownload, failDownload, completeInstall, failInstall, completeRun, failRun;

  const fakeDownload = () => {
    stubDownload = sinon.stub(KiteAPI, 'downloadKiteRelease')
    .callsFake((options) => {
      const promise = new Promise((resolve, reject) => {
        completeDownload = () => {
          options.onDownloadProgress(1, 1, 1);
          resolve();
          return promise;
        };
        failDownload = () => {
          reject();
          return promise;
        };
      });

      return promise;
    });
  };

  const fakeInstall = () => {
    let installed;
    stubInstall = sinon.stub(KiteAPI, 'installKite')
    .callsFake((options) => {
      const promise = new Promise((resolve, reject) => {
        completeInstall = () => {
          installed = true;
          resolve();
          return promise;
        };
        failInstall = () => {
          installed = false;
          reject();
          return promise;
        };
      });

      return promise;
    });
    stubIsInstalled = sinon.stub(KiteAPI, 'isKiteInstalled')
    .callsFake((options) => {
      return installed ? Promise.resolve() : Promise.reject();
    });
  };

  const fakeRun = () => {
    let running;
    stubRun = sinon.stub(KiteAPI, 'runKiteAndWait')
    .callsFake((options) => {
      const promise = new Promise((resolve, reject) => {
        completeRun = () => {
          running = true;
          resolve();
          return promise;
        };
        failRun = () => {
          running = false;
          reject();
          return promise;
        };
      });

      return promise;
    });
  };

  beforeEach(() => {
    fakeDownload();
    fakeInstall();
    fakeRun();
  });

  afterEach(() => {
    stubDownload && stubDownload.restore();
    stubInstall && stubInstall.restore();
    stubIsInstalled && stubIsInstalled.restore();
    stubRun && stubRun.restore();
    spyUpdateState && spyUpdateState.restore();
  });

  describe('when the download succeeds', () => {
    beforeEach(() => {
      step = new Download();
      promise = startStep(step);
      install = promise.install;

      spyUpdateState = sinon.spy(install, 'updateState');

      return waitsForPromise(() => completeDownload());
    });

    it('updates the install state with the progress', () => {
      expect(install.updateState.calledWithMatch({
        download: {
          length: 1,
          total: 1,
          ratio: 1,
        },
      })).to.be.ok();
    });

    it('marks the download as done when complete', () => {
      expect(install.state).to.eql({
        download: {
          length: 1,
          total: 1,
          ratio: 1,
          done: true,
        },
        install: {done: false},
      });
    });

    describe('then the install succeeds', () => {
      beforeEach(() => {
        return waitsForPromise(() => completeInstall())
        .then(() => waitsFor(() => install.state.install.done));
      });

      it('marks the install as done', () => {
        expect(install.state).to.eql({
          download: {
            length: 1,
            total: 1,
            ratio: 1,
            done: true,
          },
          install: {done: true},
          running: {done: false},
        });
      });

      describe('then the startup succeeds', () => {
        beforeEach(() => {
          return waitsForPromise(() => completeRun());
        });

        it('marks the startup as done', () => {
          return waitsForPromise(() => promise).then(() => {
            expect(install.state).to.eql({
              download: {
                length: 1,
                total: 1,
                ratio: 1,
                done: true,
              },
              install: {done: true},
              running: {done: true},
            });
          });
        });
      });

      describe('then the startup fails', () => {
        it('rejects the step promise', () => {
          failRun();
          return waitsForPromise({shouldReject: true}, () => promise).then(() => {
            expect(install.state).to.eql({
              download: {
                length: 1,
                total: 1,
                ratio: 1,
                done: true,
              },
              install: {done: true},
              running: {done: false},
            });
          });
        });
      });
    });

    describe('then the install fails', () => {
      it('rejects the step promise', () => {
        failInstall();
        return waitsForPromise({shouldReject: true}, () => promise).then(() => {
          expect(install.state).to.eql({
            download: {
              length: 1,
              total: 1,
              ratio: 1,
              done: true,
            },
            install: {done: false},
          });
        });
      });
    });
  });

  describe('when the download fails', () => {
    beforeEach(() => {
      step = new Download();
      promise = startStep(step);
      install = promise.install;

      spyUpdateState = sinon.spy(install, 'updateState');

    });

    it('rejects the step promise', () => {
      failDownload();
      return waitsForPromise({shouldReject: true}, () => promise).then(() => {
        expect(install.state).to.eql({});
      });
    });
  });
});
