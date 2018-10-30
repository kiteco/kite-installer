'use strict';

const {screenshot} =  require('./assets');


class InstallWaitElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="warning">
        <span class="icon">⚠️</span>
        <span class="message">Kite is still installing on your machine. Please do not close this tab until installation has finished.</span>
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
    this.install.emit('did-skip-whitelist');
  }

  release() {}
}

customElements.define('kite-atom-install-wait', InstallWaitElement);

module.exports = InstallWaitElement;
