const proc = require('child_process')

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

function fakeRequestMethod (resp) {
  if (typeof resp == 'boolean' && resp) { resp = {} }
  if (resp) {
    resp.headers = resp.headers || {}
  }
  return (opts, callback) => ({
    on: (type, cb) => {
      if (!resp && type === 'error') { cb({}) }
    },
    end: () => resp && callback(resp),
    write: (data) => {}
  })
}

module.exports = { fakeProcesses, fakeRequestMethod }
