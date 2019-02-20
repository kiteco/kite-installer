const fs = require('fs');
const path = require('path');

const logo = String(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'assets', 'logo.svg')));

const logoSmall = String(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'assets', 'logo-small.svg')));

const screenshot = path.resolve(__dirname, '..', '..', '..', 'assets', 'plotscreenshot.png');

const demoVideo = path.resolve(__dirname, '..', '..', '..', 'assets', 'demo.mp4');

module.exports = {logo, logoSmall, screenshot, demoVideo};
