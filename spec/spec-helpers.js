const proc = require('child_process')
const StateController = require('../lib/state-controller')

function fakeStream () {
  let streamCallback
  function stream (data) {
    streamCallback && streamCallback(data)
  }

  stream.on = (evt, callback) => {
    if (evt === 'data') { streamCallback = callback }
  }

  return stream
}

function fakeProcesses (processes) {
  spyOn(proc, 'spawn').andCallFake((process, options) => {
    const mock = processes[process]
    const ps = {
      stdout: fakeStream(),
      stderr: fakeStream(),
      on: (evt, callback) => {
        if (evt === 'close') { callback(mock ? mock(ps, options) : 1) }
      }
    }

    return ps
  })

  spyOn(proc, 'spawnSync').andCallFake((process, options) => {
    const mock = processes[process]

    const ps = {}
    ps.status = mock ? mock({
      stdout (data) { ps.stdout = data },
      stderr (data) { ps.stderr = data },
    }, options) : 1

    return ps
  })
}

function fakeResponse (statusCode, data, props) {
  data = data || ''
  props = props || {}

  const resp = {
    statusCode,
    on: (event, callback) => {
      switch (event) {
        case 'data':
          callback(data)
          break;
        case 'end':
          callback()
          break;
      }
    }
  }
  for (let k in props) { resp[k] = props[k] }
  resp.headers = resp.headers || {}
  return resp
}

function fakeRequestMethod (resp) {
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
      if (!resp && type === 'error') { cb({}) }
    },
    end: () => {
      if (resp) {
        typeof resp == 'function'
          ? callback(resp(opts))
          : callback(resp)
      }
    },
    write: (data) => {}
  })
}

function fakeKiteInstallPaths () {
  let safePaths
  beforeEach(() => {
    safePaths = StateController.KITE_APP_PATH
    StateController.KITE_APP_PATH = { installed: '/path/to/Kite.app' }
  })

  afterEach(() => {
    StateController.KITE_APP_PATH = safePaths
  })
}

function withKiteInstalled () {
  beforeEach(() => {
    StateController.KITE_APP_PATH = { installed: __filename }
  })
}

function withKiteRunning () {
  withKiteInstalled()

  beforeEach(() => {
    fakeProcesses({
      '/bin/ps': (ps) => {
        ps.stdout('Kite')
        return 0
      }
    })
  })
}

function withKiteNotRunning () {
  withKiteInstalled()

  beforeEach(() => {
    fakeProcesses({
      '/bin/ps': (ps) => {
        ps.stdout('')
        return 0
      },
      defaults: () => 0,
      open: () => 0,
    })
  })
}

module.exports = { fakeProcesses, fakeRequestMethod, fakeResponse, fakeKiteInstallPaths, withKiteRunning, withKiteNotRunning, withKiteInstalled }
