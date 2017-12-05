'use strict';

const {logoSmall, screenshot} =  require('./assets');

class InstallEndElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-install-end', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="welcome-title">
        <h3>Welcome to Kite!</h3>
        <div class="title-logo">${logoSmall}</div>
      </div>
      <div class="warning">
        Kite is still indexing some of your Python code. You\’ll see your completions improve over the next few minutes.
      </div>
      <div class="description">
        <div class="content">
          <p>You\'ll see Kite completions when writing Python in any Kite-enabled directory.</p>
          <p><strong>Kite provides the best Python completions in the world.</strong></p>
          <ul>
            <li>1.5x more completions than local engine</li>
            <li>Completions ranked by popularity</li>
            <li>2x documentation coverage</li>
          </ul>
        </div>
        <div class="description-screenshot"><img src="${screenshot}"></div>
      </div>
      <p>
        Kite is under active development. Expect many new features
        in the coming months, including formatted documentation,
        jump to definition, function call signatures, and many more</p>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }

  init() {}

  release() {}
}

module.exports = InstallEndElement.initClass();
