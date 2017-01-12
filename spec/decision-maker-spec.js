'use strict';

const http = require('http');
const DecisionMaker = require('../lib/decision-maker');
const {withFakeServer, fakeResponse, fakeRequestMethod} = require('./spec-helpers');

describe('DecisionMaker', () => {
  let decisionMaker;

  beforeEach(() => {
    decisionMaker = new DecisionMaker({
      UUID: 'kite-atom',
      name: 'atom',
    }, {
      name: 'kite-plugin',
    });
  });

  describe('.shouldOfferKite()', () => {
    describe('when the request to plugins.kite.com succeeds', () => {
      describe('and offers kite', () => {
        withFakeServer([[
          o => o.path === '/atom/events',
          o => fakeResponse(200, JSON.stringify({
            decision: true,
            variant: 'foo',
          })),
        ]], () => {
          it('returns a resolved promise', () => {
            waitsForPromise(() =>
              decisionMaker.shouldOfferKite().then(variant => {
                expect(variant).toEqual('foo');
              }));
          });
        });
      });

      describe('and does not offer kite', () => {
        withFakeServer([[
          o => o.path === '/atom/events',
          o => fakeResponse(200, JSON.stringify({
            decision: false,
            variant: 'foo',
          })),
        ]], () => {
          it('returns a rejected promise', () => {
            waitsForPromise({shouldReject: true}, () =>
              decisionMaker.shouldOfferKite());
          });
        });
      });
    });

    describe('when the request to plugins.kite.com fails', () => {
      withFakeServer([[
        o => o.path === '/atom/events',
        o => fakeResponse(500),
      ]], () => {
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () =>
            decisionMaker.shouldOfferKite());
        });
      });
    });

    describe('when the request to plugins.kite.com timeouts', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod());
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          decisionMaker.shouldOfferKite('', 1000));
      });
    });
  });
});
