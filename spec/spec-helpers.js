const http = require('http');
const proc = require('child_process');
const StateController = require('../lib/state-controller');

function fakeStream() {
  let streamCallback;
  function stream(data) {
    streamCallback && streamCallback(data);
  }

  stream.on = (evt, callback) => {
    if (evt === 'data') { streamCallback = callback; }
  };

  return stream;
}

function fakeProcesses(processes) {
  spyOn(proc, 'spawn').andCallFake((process, options) => {
    const mock = processes[process];
    const ps = {
      stdout: fakeStream(),
      stderr: fakeStream(),
      on: (evt, callback) => {
        if (evt === 'close') { callback(mock ? mock(ps, options) : 1); }
      },
    };

    return ps;
  });

  spyOn(proc, 'spawnSync').andCallFake((process, options) => {
    const mock = processes[process];

    const ps = {};
    ps.status = mock ? mock({
      stdout(data) { ps.stdout = data; },
      stderr(data) { ps.stderr = data; },
    }, options) : 1;

    return ps;
  });
}

function fakeResponse(statusCode, data, props) {
  data = data || '';
  props = props || {};

  const resp = {
    statusCode,
    on: (event, callback) => {
      switch (event) {
        case 'data':
          callback(data);
          break;
        case 'end':
          callback();
          break;
      }
    },
  };
  for (let k in props) { resp[k] = props[k]; }
  resp.headers = resp.headers || {};
  return resp;
}

function fakeRequestMethod(resp) {
  if (resp) {
    switch (typeof resp) {
      case 'boolean':
        resp = fakeResponse(200);
        break;
      case 'object':
        resp = fakeResponse(200, '', resp);
        break;
      case 'string':
        resp = fakeResponse(200, resp, {});
        break;
    }
  }

  return (opts, callback) => ({
    on: (type, cb) => {
      switch (type) {
        case 'error':
          if (!resp) { cb({}); }
          break;
        case 'response':
          if (resp) { cb(typeof resp == 'function' ? resp(opts) : resp); }
          break;
      }
    },
    end: () => {
      if (resp) {
        typeof resp == 'function'
          ? callback(resp(opts))
          : callback(resp);
      }
    },
    write: (data) => {},
  });
}

function fakeKiteInstallPaths() {
  let safePaths;
  beforeEach(() => {
    safePaths = StateController.KITE_APP_PATH;
    StateController.KITE_APP_PATH = { installed: '/path/to/Kite.app' };
  });

  afterEach(() => {
    StateController.KITE_APP_PATH = safePaths;
  });
}

function fakeRouter(routes) {
  return (opts) => {
    for (let i = 0; i < routes.length; i++) {
      const [predicate, handler] = routes[i];
      if (predicate(opts)) { return handler(opts); }
    }
    return fakeResponse(200);
  };
}

function withKiteInstalled(block) {
  describe('with kite installed', () => {
    fakeKiteInstallPaths();

    beforeEach(() => {
      StateController.KITE_APP_PATH = { installed: __filename };
    });

    block();
  });
}

function withKiteRunning(block) {
  withKiteInstalled(() => {
    describe(', running', () => {
      beforeEach(() => {
        fakeProcesses({
          ls: (ps) => ps.stdout('kite'),
          '/bin/ps': (ps) => {
            ps.stdout('Kite');
            return 0;
          },
        });
      });

      block();
    });
  });
}

function withKiteNotRunning(block) {
  withKiteInstalled(() => {
    describe(', not running', () => {
      beforeEach(() => {
        fakeProcesses({
          '/bin/ps': (ps) => {
            ps.stdout('');
            return 0;
          },
          defaults: () => 0,
          open: () => 0,
        });
      });

      block();
    });
  });
}

function withKiteReachable(routes, block) {
  if (typeof routes == 'function') {
    block = routes;
    routes = [];
  }

  routes.push([
    o => o.path === '/system',
    o => fakeResponse(200),
  ]);

  routes.push([
    o => true,
    o => fakeResponse(404),
  ]);


  withKiteRunning(() => {
    describe(', reachable', () => {
      beforeEach(function() {
        this.routes = routes.concat();
        const router = fakeRouter(this.routes);
        spyOn(http, 'request').andCallFake(fakeRequestMethod(router));
      });

      block();
    });
  });
}

function withKiteNotReachable(block) {
  withKiteRunning(() => {
    describe(', not reachable', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      block();
    });
  });
}

function withKiteAuthenticated(routes, block) {
  if (typeof routes == 'function') {
    block = routes;
    routes = [];
  }

  routes.push([
    o => /^\/api\/account\/authenticated/.test(o.path),
    o => fakeResponse(200, 'authenticated'),
  ]);

  withKiteReachable(routes, () => {
    describe(', authenticated', () => {
      block();
    });
  });
}

function withKiteNotAuthenticated(block) {
  withKiteReachable([
    [o => o.path === '/api/account/authenticated', o => fakeResponse(401)],
  ], () => {
    describe(', not authenticated', () => {
      block();
    });
  });
}

function withKiteWhitelistedPaths(paths, block) {
  if (typeof paths == 'function') {
    block = paths;
    paths = [];
  }

  const routes = [
    [
      o =>
        /^\/clientapi\/settings\/inclusions/.test(o.path) && o.method === 'GET',
      o => fakeResponse(200, JSON.stringify(paths)),
    ],
  ];

  withKiteAuthenticated(routes, () => {
    describe('with whitelisted paths', () => {
      block();
    });
  });
}

function withRoutes(routes) {
  beforeEach(function() {
    routes.reverse().forEach(route => this.routes.unshift(route));
  });
}

module.exports = {
  fakeProcesses, fakeRequestMethod, fakeResponse, fakeKiteInstallPaths,
  withKiteInstalled,
  withKiteRunning, withKiteNotRunning,
  withKiteReachable, withKiteNotReachable,
  withKiteAuthenticated, withKiteNotAuthenticated,
  withKiteWhitelistedPaths,
  withRoutes,
};
