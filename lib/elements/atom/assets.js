const fs = require('fs');
const path = require('path');

let LogoPath = '../../../assets/logo.svg';
let LogoSmallPath = '../../../assets/logo-small.svg';
let ScreenshotPath = '../../../assets/plotscreenshot.png';
let DemoVideoPath = '../../../assets/demo.mp4';
let InstallLessPath = '../../../styles/install.less';

// Environment variable set by consumer repository using Webpack Plugins via config.
if (process.env.USING_WEBPACK_FILELOADER_TO_BUNDLE) {
  const WEBPACK_FILELOADER_PATH_KEY = "default";

  LogoPath = require('../../../assets/logo.svg')[WEBPACK_FILELOADER_PATH_KEY];
  LogoSmallPath = require('../../../assets/logo-small.svg')[WEBPACK_FILELOADER_PATH_KEY];
  ScreenshotPath = require('../../../assets/plotscreenshot.png')[WEBPACK_FILELOADER_PATH_KEY];
  DemoVideoPath = require('../../../assets/demo.mp4')[WEBPACK_FILELOADER_PATH_KEY];
  InstallLessPath = require('../../../styles/install.less')[WEBPACK_FILELOADER_PATH_KEY];
}

const logo = String(fs.readFileSync(path.resolve(__dirname, LogoPath)));

const logoSmall = String(fs.readFileSync(path.resolve(__dirname, LogoSmallPath)));

const screenshot = path.resolve(__dirname, ScreenshotPath);

const demoVideo = path.resolve(__dirname, DemoVideoPath);

const installLess = path.resolve(__dirname, InstallLessPath);

module.exports = {logo, logoSmall, screenshot, demoVideo, installLess};
