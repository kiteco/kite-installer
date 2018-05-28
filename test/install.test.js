'use strict';

const Install = require('../lib/install');
const GetEmail = require('../lib/install/get-email');
const {waitsForPromise} = require('kite-connect/test/helpers/async');

describe('Install', () => {
  let install;

  beforeEach(() => {
    install = new Install([
      new GetEmail(),
    ]);
  });

  it('behaves like a thenable', () => {
    return waitsForPromise(() => install.start());
  });
});
