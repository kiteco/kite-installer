const proc = require('child_process')

function fakeProcesses (processes) {
  spyOn(proc, 'spawn').andCallFake((process, options) => {
    const mock = processes[process]

    return ({
      on: (evt, callback) => {
        if (evt === 'close') { callback(mock ? mock(options) : 1) }
      }
    })
  })
}

module.exports = { fakeProcesses }
