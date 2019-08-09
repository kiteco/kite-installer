'use strict';

const InstallError = require('./install-error-element');
const {logo} = require('./assets');

class InstallErrorView extends HTMLElement {
  constructor(install) {
    super();
    this.name = 'kite_install_error_view';

    this.innerHTML = `<div class="install-wrapper">
      <div class="logo">${logo}</div>
      <div class="content">
      </div>  
    </div>`;

    let errorElement = new InstallError('kite_installer_install_error');
    this.querySelector('.content').appendChild(errorElement);
    errorElement.init(install);
  }

  // noinspection JSMethodCanBeStatic
  getTitle() {
    return 'Kite Install Error';
  }
}

customElements.define('kite-atom-install-error-view', InstallErrorView);

module.exports = InstallErrorView;
