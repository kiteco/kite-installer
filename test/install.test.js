'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const Install = require('../lib/install');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const DummyStep = require('./helpers/dummy-step');

describe('Install', () => {
  let install;

  beforeEach(() => {
    install = new Install([
      new DummyStep(s => s.resolve()),
    ]);
  });

  it('behaves like a thenable', () => {
    return waitsForPromise(() => install.start());
  });

  describe('.getTitle()', () => {
    it('returns a default string when title has been provided', () => {
      expect(install.getTitle()).to.eql('Kite Install');
    });

    it('returns the title passed in options', () => {
      install = new Install([], {}, {
        title: 'some title',
      });

      expect(install.getTitle()).to.eql('some title');
    });
  });

  describe('events', () => {
    let spyState, spyStep, spyDestroy, spyStateUpdate;

    beforeEach(() => {
      spyState = sinon.spy();
      spyStep = sinon.spy();
      spyDestroy = sinon.spy();
      spyStateUpdate = sinon.spy();
    });

    it('emits events based on step actions', () => {
      install = new Install([
        new DummyStep(s => s.resolve({foo: 'bar'})),
        new DummyStep(s => s.resolve({foo: 'baz'})),
        new DummyStep(s => s.resolve({foo: null})),
      ]);
      install.observeState(spyState);
      install.onDidUdpdateState(spyStateUpdate);
      install.onDidDestroy(spyDestroy);
      install.onDidChangeCurrentStep(spyStep);

      return waitsForPromise(() => install.start()).then(() => {
        expect(spyState.callCount).to.eql(4); // initial state + 3 updates
        expect(spyStateUpdate.callCount).to.eql(3);
        expect(spyStep.callCount).to.eql(3);

        install.destroy();
        expect(spyDestroy.callCount).to.eql(1);
      });
    });
  });
});
