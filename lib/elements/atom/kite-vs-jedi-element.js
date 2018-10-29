'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class KiteVsJediElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <h2 class="text-center">Choose your autocomplete-python engine</h2>
    <div id="kite" class="comparison inset-panel">
      <div class="heading bordered">
        <div class="title">
          <h3>Kite + Jedi</h3>
        </div>
        <div class="subtitle">
          <h4>AI-powered Engine</h4>
        </div>
      </div>
      <div class="body bordered">
        <div class="summary">
          Kite runs locally on your computer and uses machine learning to provide advanced completions
        </div>
        <ul class="features">
          <li class="feature icon icon-check">All the features of Jedi and...</li>
          <li class="feature icon icon-check">Ranked keyword and function completions</li>
          <li class="feature icon icon-check">1.5x more completions</li>
          <li class="feature icon icon-check">Instant docs and search</li>
        </ul>
        <a href="https://github.com/davidhalter/jedi">Learn More</a>
      </div>
      <div class="actions">
        <div class="cta-container">
          <button class="btn btn-primary">
            <span class="icon icon-plus"></span>Add and Signup
          </button>
        </div>
        <div class="disclaimer">
          Kite is free to use and comes with a native app that runs a more intelligent Python engine.
        </div>
      </div>
    </div>
    <div id="jedi" class="comparison inset-panel">
      <div class="heading bordered">
        <div class="title">
          <h3>Jedi</h3>
        </div>
        <div class="subtitle">
          <h4>Basic Engine</h4>
        </div>
      </div>
      <div class="body bordered">
        <div class="summary">
          Jedi runs locally on your computer using the Jedi Python engine
        </div>
        <ul class="features">
          <li class="feature icon icon-check">Keyword and function completions</li>
          <li class="feature icon icon-check">Go-to definitions</li>
          <li class="feature icon icon-check">Usages</li>
        </ul>
        <a href="https://github.com/davidhalter/jedi">Learn More</a>
      </div>
      <div class="actions">
        <div class="cta-container">
          <button class="btn btn-success selected disabled">
            <span class="icon icon-check"></span>Installed
          </button>
        </div>
        <div class="disclaimer">
          Jedi is the stock engine that comes with autocomplete-python by default.
        </div>
      </div>
    </div>
    <center>
      <div class="dismiss">
        <a href="#">Dismiss</a>
      </div>
    </center>
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
