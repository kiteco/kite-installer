'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

const {demoVideo} =  require('./assets');

class KiteVsJediElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <h2><span class="icon">📦</span> autocomplete-python installed successfully</h2>
    <div id="kite" class="inset-panel kite-description">
      <h3>Level up your completions with Kite</h3>
      <div class="columns">
        <div class="body">
          <div class="summary">
            Kite is a native app that runs locally on your computer and uses machine learning to provide advanced completions
          </div>
          <ul class="features">
            <li class="feature icon icon-check">All the features of autocomplete-python and...</li>
            <li class="feature icon icon-check">1.5x more completions</li>
            <li class="feature icon icon-check">Completions ranked by code context</li>
            <li class="feature icon icon-check">Full line of code completions</li>
            <li class="feature icon icon-check">100% local - no internet connection required</li>
            <li class="feature icon icon-check">100% free to use</li>
          </ul>
          <div class="more">
            <a href="https://kite.com">Learn more</a>
          </div>
        </div>
        <div class="actions">
          <video autoplay loop playsinline>
            <source src="${demoVideo}" type="video/mp4">
          </video>
          <div class="cta-container">
            <center>
              <button class="btn btn-primary">
                <span class="icon icon-cloud-download"></span>Add Kite
              </button>
            </center>
          </div>
        </div>
      </div>
    </div>
    <div class="dismiss">
      <a href="#">Dismiss</a>
    </div>
    `;

    this.skipButton = this.querySelector('.dismiss a');
    this.nextButton = this.querySelector('#kite .actions .cta-container .btn');
  }

  init(install) {
    this.install = install;
    this.subscriptions = new CompositeDisposable();

    this.install.updateState({kiteLogoVisible: false});

    this.subscriptions.add(addDisposableEventListener(this.skipButton, 'click', () => {
      this.install.emit('did-skip-install');
    }));

    this.subscriptions.add(addDisposableEventListener(this.nextButton, 'click', () => {
      this.install.updateState({kiteLogoVisible: true});
      this.install.emit('did-pick-install');
    }));
  }

  release() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.subscriptions;
  }
}

customElements.define('kite-atom-kite-vs-jedi', KiteVsJediElement);

module.exports = KiteVsJediElement;
