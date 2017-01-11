'use strict';

const http = require('http');
const https = require('https');
const Client = require('../lib/client');
const {fakeRequestMethod} = require('./spec-helpers');

describe('Client', () => {
  let client, hostname, port, base, promise;

  beforeEach(() => {
    hostname = 'localhost';
    port = 1234;
    base = 'base';
    client = new Client(hostname, port, base);
  });

  describe('.request()', () => {
    describe('when ssl protocol is enabled', () => {
      beforeEach(() => {
        client.protocol = https;
      });

      describe('and the request succeeds', () => {
        beforeEach(() => {
          spyOn(https, 'request').andCallFake(fakeRequestMethod(true));
          promise = client.request({path: '/foo'});
        });

        it('returns a promise that will be resolved once completed', () => {
          waitsForPromise(() => promise);
          runs(() => {
            expect(https.request).toHaveBeenCalled();
          });
        });
      });

      describe('and the request fails', () => {
        beforeEach(() => {
          spyOn(https, 'request').andCallFake(fakeRequestMethod(false));
          promise = client.request({path: '/foo'});
        });

        it('returns a promise that will be rejected', () => {
          waitsForPromise({shouldReject: true}, () => promise);
        });
      });

      describe('and the request timeout', () => {
        beforeEach(() => {
          spyOn(https, 'request').andCallFake(fakeRequestMethod());
          promise = client.request({path: '/foo'}, '', 1000);
        });

        it('returns a promise that will be rejected', () => {
          waitsForPromise({shouldReject: true}, () => promise);
        });
      });
    });

    describe('when ssl protocol is disabled', () => {
      describe('and the request succeeds', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(true));
          promise = client.request({path: '/foo'});
        });

        it('returns a promise that will be resolved once completed', () => {
          waitsForPromise(() => promise);
          runs(() => {
            expect(http.request).toHaveBeenCalled();
          });
        });
      });

      describe('and the request fails', () => {
        beforeEach(() => {
          spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
          promise = client.request({path: '/foo'});
        });

        it('returns a promise that will be rejected', () => {
          waitsForPromise({shouldReject: true}, () => promise);
        });
      });
    });

    describe('when the response contains a set-cookie header', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod({
          headers: {
            'set-cookie': ['foo=bar', 'baz=foo'],
          },
        }));
        promise = client.request({path: '/foo'});
      });

      it('stores the received cookies in the client', () => {
        waitsForPromise(() => promise);
        runs(() => {
          expect(Object.keys(client.cookies).length).toEqual(2);
          expect(client.cookies.foo.Name).toEqual('foo');
          expect(client.cookies.foo.Value).toEqual('bar');
          expect(client.cookies.baz.Name).toEqual('baz');
          expect(client.cookies.baz.Value).toEqual('foo');
        });
      });
    });

    describe('when the client has cookies', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(true));
        client.cookies = {
          foo: { Name: 'foo', Value: 'bar' },
          baz: { Name: 'baz', Value: 'foo' },
        };
        promise = client.request({path: '/foo'});
      });

      it('sends the stored cookies in the next request', () => {
        waitsForPromise(() => promise);
        runs(() => {
          expect(http.request.mostRecentCall.args[0].headers.Cookies).toEqual('foo=bar; baz=foo');
        });
      });
    });
  });
});
