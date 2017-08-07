const os = require('os');

module.exports = () => {
  const {
    Logger,
    AccountManager,
    install: {
      KiteVsJedi,
      Install,
      atom: {
        KiteVsJediElement,
        defaultFlow,
      },
    },
  } = require('../lib');

  const install = new Install([
    new KiteVsJedi({
      name: 'kite-vs-jedi',
      view: new KiteVsJediElement(),
    }),
  ].concat(defaultFlow()), {
    path: atom.project.getPaths()[0] || os.homedir(),
  }, {
    failureStep: 'termination',
    title: 'Some Item Title Example',
  });

  Logger.LEVEL = Logger.LEVELS.DEBUG;

  AccountManager.initClient('alpha.kite.com', -1, true);

  atom.workspace.getActivePane().addItem(install);
  atom.workspace.getActivePane().activateItem(install);

  install.start()
  .then(result => console.log(result))
  .catch(err => console.error(err));
};
