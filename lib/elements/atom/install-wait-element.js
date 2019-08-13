'use strict';

const {screenshot} =  require('./assets');


class InstallWaitElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="description">
        <div class="content">
          <p>Kite comes with a native desktop app called the Copilot which provides you with real time documentation as you code.</p>
          <p>When Kite for Atom is done installing, the Copilot will launch automatically and take you through the rest of the setup process.</p>
        </div>
        <div class="description-screenshot"><img src="${screenshot}"></div>
      </div>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }

  init(install) {
    this.install = install;
    this.install.emit('did-skip-whitelist');
  }

  release() {}
}

customElements.define('kite-atom-install-wait', InstallWaitElement);

module.exports = InstallWaitElement;
