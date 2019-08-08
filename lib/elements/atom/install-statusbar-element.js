'use strict';

const CompositeDisposable = require('../../install/composite-disposable');

class InstallStatusBarElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.className = 'kite-install-status';
    this.classList.add('inline-block');
    this.subscriptions = new CompositeDisposable();
    this.currentStatusText = '';
  }

  destroyTile() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
    if (this.statusBarTile) {
      this.statusBarTile.destroy();
      this.statusBarTile = null;
    }
  }

  init(install, statusBar) {
    this.subscriptions.add(atom.tooltips.add(this, {
      title: 'Kite will start automatically after being installed'
    }));

    this.statusBarTile = statusBar.addRightTile({item: this});
    this.subscriptions.add(install.on('encountered-fatal-error', (err) => {
      console.log('fatal status bar error: ' + err);
      this.destroyTile();
    }));

    this.subscriptions.add(install.onDidFailStep(({error}) => {
      console.log('fatal status bar error:' + (error && error.message));
      this.destroyTile();
    }));

    this.subscriptions.add(install.observeState((state) => {
      let newStatusText;
      if (state.download) {
        newStatusText = 'Downloading Kite';
      }

      if ((state.download && state.download.done) || state.install) {
        newStatusText = 'Installing Kite';
      }

      if (state.running) {
        newStatusText = 'Starting Kite';
      }

      if (state.plugin) {
        if (state.plugin.done) {
          this.destroyTile();
          newStatusText = '';
        } else {
          newStatusText = 'Installing Kite plugin';
        }
      }

      if (newStatusText && newStatusText !== this.currentStatusText) {
        this.currentStatusText = newStatusText;
        this.innerHTML = `<span class="loading loading-spinner-tiny inline-block icon"></span><span class="text"> ${newStatusText}</span>`;
      }
    }));
  }

  release() {
    // this.destroyTile()
  }
}

customElements.define('kite-atom-install-statusbar', InstallStatusBarElement);

module.exports = InstallStatusBarElement;
