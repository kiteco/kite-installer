'use strict';

const sinon = require('sinon');
const expect = require('expect.js');

const CompositeDisposable = require('../../lib/install/composite-disposable');

class DummyDisposable {
  constructor() {
    this.dispose = sinon.spy();
  }
}

describe('CompositeDisposable', () => {
  let composite;

  beforeEach(() => {
    composite = new CompositeDisposable();
  });

  it('takes an array of disposables as constructor argument', () => {
    const disposable1 = new DummyDisposable();
    const disposable2 = new DummyDisposable();
    const composite = new CompositeDisposable([disposable1, disposable2]);

    composite.dispose();

    expect(disposable1.dispose.called).to.be.ok();
    expect(disposable2.dispose.called).to.be.ok();
  });

  describe('.add()', () => {
    it('adds a disposable only once in the composite', () => {
      const disposable = new DummyDisposable();

      composite.add(disposable);
      composite.add(disposable);
      composite.add(disposable);

      composite.dispose();

      expect(disposable.dispose.called).to.be.ok();
      expect(disposable.dispose.callCount).to.eql(1);
    });

    it('does nothing when called with no disposable', () => {
      expect(() => composite.add()).not.to.throwError();
    });
  });

  describe('.remove()', () => {
    it('removes a disposable already in the composite', () => {
      const disposable = new DummyDisposable();

      composite.add(disposable);
      composite.remove(disposable);

      composite.dispose();

      expect(disposable.dispose.called).not.to.be.ok();
    });

    it('does nothing when called with no disposable', () => {
      expect(() => composite.add()).not.to.throwError();
    });

    it('does nothing when called a disposable not in the composite', () => {
      const disposable = new DummyDisposable();

      expect(() => composite.remove(disposable)).not.to.throwError();
    });
  });
});
