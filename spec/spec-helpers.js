
let OSXSupport, WindowsSupport;

const os = require('os');
const http = require('http');
const https = require('https');
const proc = require('child_process');

// This ensure that the env variables required by the
// windows support object are available even on another platform.
if (os.platform() !== 'win32') {
  process.env.TMP = os.tmpDir();
  process.env.ProgramW6432 = os.tmpDir();
  process.env.LOCALAPPDATA = os.tmpDir();
}

function fakeStdStream() {
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
      stdout: fakeStdStream(),
      stderr: fakeStdStream(),
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

  if (processes.exec) {
    spyOn(proc, 'exec').andCallFake((process, options, callback) => {
      const mock = processes.exec[process];

      let stdout, stderr;

      const status = mock ? mock({
        stdout(data) { stdout = data; },
        stderr(data) { stderr = data; },
      }, options) : 1;

      status === 0
        ? callback(null, stdout)
        : callback({}, stdout, stderr);
    });
  }
}

function fakeStream() {
  return {
    on(evt, callback) {
      if (evt === 'finish') {
        callback && callback();
      }
    },
  };
}

function fakeResponse(statusCode, data, props) {
  data = data || '';
  props = props || {};

  const resp = {
    statusCode,
    pipe(stream) {
      return fakeStream();
    },
    on(event, callback) {
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
  resp.headers = resp.headers || {
    'content-length': data.length,
  };
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

  return (opts, callback) => {
    const req = {
      on(type, cb) {
        switch (type) {
          case 'error':
            if (resp === false) { cb({}); }
            break;
          case 'response':
            if (resp) {
              const respObject = typeof resp == 'function'
                ? resp(opts)
                : resp;
              respObject.req = req;
              cb(respObject);
            }
            break;
        }
      },
      end() {
        if (resp && callback) {
          const respObject = typeof resp == 'function'
            ? resp(opts)
            : resp;
          respObject.req = req;
          callback(respObject);
        }
      },
      write(data) {},
      setTimeout(timeout, callback) {
        if (resp == null) { callback({}); }
      },
    };

    return req;
  };
}

function fakeKiteInstallPaths() {
  let safePaths;
  beforeEach(() => {
    switch (os.platform()) {
      case 'darwin':
        if (!OSXSupport) {
          OSXSupport = require('../lib/support/osx');
        }
        safePaths = OSXSupport.KITE_APP_PATH;
        OSXSupport.KITE_APP_PATH = {
          installed: '/path/to/Kite.app',
        };
        break;
      case 'win32':
        if (!WindowsSupport) {
          WindowsSupport = require('../lib/support/windows');
        }
        safePaths = WindowsSupport.KITE_EXE_PATH;
        WindowsSupport.KITE_EXE_PATH = 'C:\\Windows\\Kite.exe';
        break;
    }
  });

  afterEach(() => {
    switch (os.platform()) {
      case 'darwin':
        OSXSupport.KITE_APP_PATH = safePaths;
        break;
      case 'win32':
        WindowsSupport.KITE_EXE_PATH = safePaths;
        break;
    }
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
      switch (os.platform()) {
        case 'darwin':
          if (!OSXSupport) {
            OSXSupport = require('../lib/support/osx');
          }
          OSXSupport.KITE_APP_PATH = { installed: __filename };
          break;
        case 'win32':
          if (!WindowsSupport) {
            WindowsSupport = require('../lib/support/windows');
          }
          WindowsSupport.KITE_EXE_PATH = __filename;
          break;
      }
    });

    block();
  });
}

function withKiteRunning(block) {
  withKiteInstalled(() => {
    describe(', running', () => {
      beforeEach(() => {
        switch (os.platform()) {
          case 'darwin':
            fakeProcesses({
              '/bin/ps': (ps) => {
                ps.stdout('Kite');
                return 0;
              },
            });
            break;
          case 'win32':
            fakeProcesses({
              'tasklist': (ps) => {
                ps.stdout('kited.exe');
                return 0;
              },
            });
            break;
        }
      });

      block();
    });
  });
}

function withKiteNotRunning(block) {
  withKiteInstalled(() => {
    describe(', not running', () => {
      beforeEach(() => {
        switch (os.platform()) {
          case 'darwin':
            fakeProcesses({
              '/bin/ps': (ps) => {
                ps.stdout('');
                return 0;
              },
              defaults: () => 0,
              open: () => 0,
            });
            break;
          case 'win32':
            fakeProcesses({
              'tasklist': (ps) => {
                ps.stdout('');
                return 0;
              },
              [WindowsSupport.KITE_EXE_PATH]: () => 0,
            });
            break;
        }
      });

      block();
    });
  });
}
function withFakeServer(routes, block) {
  if (typeof routes == 'function') {
    block = routes;
    routes = [];
  }

  routes.push([o => true, o => fakeResponse(404)]);

  describe('', () => {
    beforeEach(function() {
      this.routes = routes.concat();
      const router = fakeRouter(this.routes);
      spyOn(http, 'request').andCallFake(fakeRequestMethod(router));
      spyOn(https, 'request').andCallFake(fakeRequestMethod(router));
    });

    block();
  });
}

function withKiteReachable(routes, block) {
  if (typeof routes == 'function') {
    block = routes;
    routes = [];
  }

  routes.push([o => o.path === '/system', o => fakeResponse(200)]);

  withKiteRunning(() => {
    describe(', reachable', () => {
      withFakeServer(routes, () => {
        block();
      });
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
  withFakeServer, withRoutes,
};
