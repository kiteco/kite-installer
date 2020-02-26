const fs = require('fs');
const path = require('path');

const PATH_KEY = "default";

const LogoPath = require('../../../assets/logo.svg')[PATH_KEY];
const LogoSmallPath = require('../../../assets/logo-small.svg')[PATH_KEY];
const ScreenshotPath = require('../../../assets/plotscreenshot.png')[PATH_KEY];
const DemoVideoPath = require('../../../assets/demo.mp4')[PATH_KEY];

const logo = String(fs.readFileSync(path.resolve(__dirname, LogoPath)));

const logoSmall = String(fs.readFileSync(path.resolve(__dirname, LogoSmallPath)));

const screenshot = path.resolve(__dirname, ScreenshotPath);

const demoVideo = path.resolve(__dirname, DemoVideoPath);

module.exports = {logo, logoSmall, screenshot, demoVideo};
