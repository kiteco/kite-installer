'use strict';

const {logoSmall, screenshot} =  require('./assets');

class InstallEndElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="welcome-title">
        <h3>Welcome to Kite!</h3>
        <div class="title-logo">${logoSmall}</div>
      </div>
      <div class="warning">
        <span class="icon">🎉</span>
        <span class="message">Kite is now integrated with Atom. You\'ll see your completions improve over the next few minutes as Kite analyzes your code.</span>
      </div>
      <div class="description">
        <div class="content">
          <p>Kite provides the best Python completions in the world</p>
          <ul>
            <li>1.5x more completions than the basic engine</li>
            <li>Completions ranked by popularity</li>
            <li>2x documentation coverage</li>
          </ul>
        </div>
        <div class="description-screenshot"><img src="${screenshot}"></div>
      </div>
      <p>
        Kite is under active development. You can expect our completions
        to improve significantly and become more intelligent over the coming
        months.</p>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }

  init(install) {
    this.install = install;
    this.install.updateState({kiteLogoVisible: false});
  }

  release() {}
}

customElements.define('kite-atom-install-end', InstallEndElement);

module.exports = InstallEndElement;
