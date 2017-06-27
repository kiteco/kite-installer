
let WindowsSupport;

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

beforeEach(() => {
  jasmine.useRealClock();
});

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

const merge = (a, b) => {
  const c = {};
  for (const k in a) { c[k] = a[k]; }
  for (const k in b) { c[k] = b[k]; }
  return c;
};

let _processes;
function fakeProcesses(processes) {
  if (proc.spawn.isSpy) {
    _processes = merge(_processes, processes);
  } else {
    spyOn(proc, 'spawn').andCallFake((process, options) => {
      const mock = _processes[process];
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
      const mock = _processes[process];

      const ps = {};
      ps.status = mock ? mock({
        stdout(data) { ps.stdout = data; },
        stderr(data) { ps.stderr = data; },
      }, options) : 1;

      return ps;
    });


    _processes = processes;
  }

  if (processes.exec && !proc.exec.isSpy) {
    spyOn(proc, 'exec').andCallFake((process, options, callback) => {
      const mock = _processes.exec[process];

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
        fakeProcesses({
          'mdfind': (ps) => {
            ps.stdout('');
            return 0;
          },
        });
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
          fakeProcesses({
            'mdfind': (ps, args) => {
              const [, key] = args[0].split(/\s=\s/);
              key === '"com.kite.Kite"'
                ? ps.stdout('/Applications/Kite.app')
                : ps.stdout('');
              return 0;
            },
          });
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

function withKiteEnterpriseInstalled(block) {
  describe('with kite enterprise installed', () => {
    fakeKiteInstallPaths();

    beforeEach(() => {
      switch (os.platform()) {
        case 'darwin':
          fakeProcesses({
            'mdfind': (ps, args) => {
              const [, key] = args[0].split(/\s=\s/);
              key === '"enterprise.kite.Kite"'
                ? ps.stdout('/Applications/KiteEnterprise.app')
                : ps.stdout('');
              return 0;
            },
          });
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

function withBothKiteInstalled(block) {
  describe('with both kite and kite enterprise installed', () => {
    fakeKiteInstallPaths();

    beforeEach(() => {
      switch (os.platform()) {
        case 'darwin':
          fakeProcesses({
            'mdfind': (ps, args) => {
              const [, key] = args[0].split(/\s=\s/);
              key === '"enterprise.kite.Kite"'
                ? ps.stdout('/Applications/KiteEnterprise.app')
                : ps.stdout('/Applications/Kite.app');
              return 0;
            },
          });
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

function withKiteEnterpriseRunning(block) {
  withKiteEnterpriseInstalled(() => {
    describe(', running', () => {
      beforeEach(() => {
        switch (os.platform()) {
          case 'darwin':
            fakeProcesses({
              '/bin/ps': (ps) => {
                ps.stdout('KiteEnterprise');
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

function withKiteEnterpriseNotRunning(block) {
  withKiteEnterpriseInstalled(() => {
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
    o => /^\/clientapi\/user/.test(o.path),
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
    [o => o.path === '/clientapi/user', o => fakeResponse(401)],
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

  const authRe = /^\/clientapi\/permissions\/authorized\?filename=(.+)$/;
  const projectDirRe = /^\/clientapi\/projectdir\?filename=(.+)$/;
  const whitelisted = match => paths.some(p => match.indexOf(p) !== -1);

  const routes = [
    [
      o => {
        const match = authRe.exec(o.path);
        return match && whitelisted(match[1]);
      },
      o => fakeResponse(200),
    ], [
      o => {
        const match = authRe.exec(o.path);
        return match && !whitelisted(match[1]);
      },
      o => fakeResponse(403),
    ], [
      o => projectDirRe.test(o.path),
      o => fakeResponse(200, os.homedir()),
    ],
  ];

  withKiteAuthenticated(routes, () => {
    describe('with whitelisted paths', () => {
      block();
    });
  });
}

function withKiteIgnoredPaths(paths) {
  const authRe = /^\/clientapi\/permissions\/authorized\?filename=(.+)$/;
  const ignored = match => paths.some(p => match.indexOf(p) !== -1);

  withKiteBlacklistedPaths(paths);
  withRoutes([
    [
      o => {
        const match = authRe.exec(o.path);
        return o.method === 'GET' && match && ignored(match[1]);
      },
      o => fakeResponse(403),
    ],
  ]);
}

function withKiteBlacklistedPaths(paths) {
  const projectDirRe = /^\/clientapi\/projectdir\?filename=(.*)$/;
  const blacklisted = path => paths.some(p => path.indexOf(p) !== -1);

  withRoutes([
    [
      o => {
        const match = projectDirRe.exec(o.path);
        return o.method === 'GET' && match && blacklisted(match[1]);
      },
      o => fakeResponse(403),
    ],
  ]);
}

function withRoutes(routes) {
  beforeEach(function() {
    routes.reverse().forEach(route => this.routes.unshift(route));
  });
}

module.exports = {
  fakeProcesses, fakeRequestMethod, fakeResponse, fakeKiteInstallPaths,
  withKiteInstalled, withKiteEnterpriseInstalled, withBothKiteInstalled,
  withKiteRunning, withKiteNotRunning, withKiteEnterpriseRunning,
  withKiteEnterpriseNotRunning,
  withKiteReachable, withKiteNotReachable,
  withKiteAuthenticated, withKiteNotAuthenticated,
  withKiteWhitelistedPaths, withKiteIgnoredPaths, withKiteBlacklistedPaths,
  withFakeServer, withRoutes,
};
