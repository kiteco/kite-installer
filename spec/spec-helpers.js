const proc = require('child_process')

function fakeProcesses (processes) {
  spyOn(proc, 'spawn').andCallFake((process, options) => {
    const mock = processes[process]

    return {
      on: (evt, callback) => {
        if (evt === 'close') { callback(mock ? mock(this, options) : 1) }
      }
    }
  })

  spyOn(proc, 'spawnSync').andCallFake((process, options) => {
    const mock = processes[process]

    const ps = {}
    ps.status = mock ? mock(ps, options) : 1

    return ps
  })
}

module.exports = { fakeProcesses }
