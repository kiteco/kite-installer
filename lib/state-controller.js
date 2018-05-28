'use strict';

const {STATES} = require('kite-connect/lib/constants');

const StateController = {
  STATES,

  get support() {

  },

  get releaseURL() {

  },

  get downloadPath() {

  },

  get installPath() {

  },

  handleState() {

  },

  arch() {

  },

  isAdmin() {

  },

  isOSSupported() {

  },

  isOSVersionSupported() {

  },

  isKiteSupported() {
  },

  hasManyKiteInstallation() {

  },

  hasManyKiteEnterpriseInstallation() {

  },

  isKiteInstalled() {

  },

  isKiteEnterpriseInstalled() {

  },

  hasBothKiteInstalled() {

  },

  canInstallKite() {

  },

  downloadKiteRelease(opts) {

  },

  downloadKite(url, opts) {

  },

  installKite(opts) {

  },

  isKiteRunning() {

  },

  canRunKite() {

  },

  runKite() {

  },

  runKiteAndWait(attempts, interval) {

  },

  isKiteEnterpriseRunning() {

  },

  canRunKiteEnterprise() {

  },

  runKiteEnterprise() {

  },

  runKiteEnterpriseAndWait(attempts, interval) {

  },

  isKiteReachable() {

  },

  waitForKite(attempts, interval) {

  },

  isUserAuthenticated() {

  },

  canAuthenticateUser() {

  },

  authenticateUser(email, password) {

  },

  authenticateSessionID(key) {


  },

  isPathWhitelisted(path) {

  },

  pathInWhitelist(path) {

  },

  canWhitelistPath(path) {

  },

  whitelistPath(path) {

  },

  blacklistPath(path, noAction = false) {

  },

  saveUserID() {

  },
};

module.exports = StateController;
