'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class KiteVsJediElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <h2 class="text-center">Choose your autocomplete-python engine</h2>
    <div class="comparison row">
      <div class="inset-panel padded jedi">
        <h3 class="row text-highlight">
          <div>Jedi</div>
          <div class="text-right">Local Engine</div>
        </h3>
        <div class="column">
          <ul class="features">
            <li class="feature icon icon-check">Keyword and function completions</li>
            <li class="feature icon icon-check">Go-to definitions</li>
            <li class="feature icon icon-check">Usages</li>
          </ul>
          <div class="localities">
            <div class="locality icon icon-package">
              Jedi runs locally on your machine using the Jedi Python engine.
              <a href="https://github.com/davidhalter/jedi">Learn more.</a>
            </div>
          </div>
        </div>
        <center class="cta-row">
          <button class="btn btn-primary">Install</button>
        </center>
      </div>
      <div class="inset-panel padded kite">
        <h3 class="row text-highlight">
          <div>Kite + Jedi</div>
          <div class="text-right">Cloud Powered</div>
        </h3>
        <div class="column">
          <ul class="features">
            <li class="feature icon icon-check">All the features of Jedi and...</li>
            <li class="feature icon icon-check">Ranked keyword and function completions</li>
            <li class="feature icon icon-check">1.5x more completions</li>
            <li class="feature icon icon-check">Docs and examples from StackOverflow and GitHub</li>
            <li class="feature icon icon-check">Search</li>
          </ul>
          <div class="localities">
            <div class="locality icon icon-cloud-upload">
              Kite comes with a native app that syncs your code to the cloud,
              where it is analyzed to give you more results.
              <a href="https://kite.com/blog/faq-autocomplete-python?source=autocomplete-python">Learn more.</a>
            </div>
          </div>
        </div>

        <center class="cta-row"><button class="btn btn-primary">Install and signup</button></center>
      </div>
    </div>`;

    this.skipButton = this.querySelector('.jedi .btn');
    this.nextButton = this.querySelector('.kite .btn');
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
