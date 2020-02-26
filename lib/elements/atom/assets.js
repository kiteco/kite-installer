const fs = require('fs');
const path = require('path');

const WEBPACK_FILELOADER_PATH_KEY = "default";

const LogoPath = require('../../../assets/logo.svg')[WEBPACK_FILELOADER_PATH_KEY];
const LogoSmallPath = require('../../../assets/logo-small.svg')[WEBPACK_FILELOADER_PATH_KEY];
const ScreenshotPath = require('../../../assets/plotscreenshot.png')[WEBPACK_FILELOADER_PATH_KEY];
const DemoVideoPath = require('../../../assets/demo.mp4')[WEBPACK_FILELOADER_PATH_KEY];
const InstallLessPath = require('../../../styles/install.less')[WEBPACK_FILELOADER_PATH_KEY];

const logo = String(fs.readFileSync(path.resolve(__dirname, LogoPath)));

const logoSmall = String(fs.readFileSync(path.resolve(__dirname, LogoSmallPath)));

const screenshot = path.resolve(__dirname, ScreenshotPath);

const demoVideo = path.resolve(__dirname, DemoVideoPath);

const installLess = path.resolve(__dirname, InstallLessPath);

module.exports = {logo, logoSmall, screenshot, demoVideo, installLess};
