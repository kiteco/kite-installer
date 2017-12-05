'use strict';

const Install = require('../lib/install');
const GetEmail = require('../lib/install/get-email');

describe('Install', () => {
  let install;

  beforeEach(() => {
    install = new Install([
      new GetEmail(),
    ]);
  });

  it('behaves like a thenable', () => {
    waitsForPromise(() => install.start());
  });
});
