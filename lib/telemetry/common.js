var crypto = require('crypto');
var os = require('os');
var path = require('path');

var EXTENSIONS = "go,js,cpp,java,py,php,m,h,scala,c,cs,pl,rb,sh,html,less,css,md,asp,aspx,cfm,yaws,swf,htm,xhtml,jsp,jspx,do,action,php4,php3,xml,svg,coffee,_coffee,rhtml,jsx".split(",");

var getAddresses = function() {
  var hashedAddresses = [];
  var sha1 = crypto.createHash("sha1");
  var addresses = os.networkInterfaces();
  for (var key in addresses) {
    if (key && key.startsWith("en")) {
      Array.prototype.push.apply(hashedAddresses, addresses.en0.map(function(addr) {
        return sha1.update(addr.mac).digest("hex");
      }));
    }
  }
  console.log(hashedAddresses);
  return hashedAddresses;
};


var getPackages = function() {
  var packages = atom.packages.getActivePackages();
  packages = packages.map(function(package) {
    if (!package.bundledPackage) {
      return package.name;
    }
  });
  packages = packages.filter(function(package) {
    return package != null;
  });
  packages = packages.sort();
  return packages;
};

var getActiveExtension = function() {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return;
  }
  var ext = path.extname(editor.getPath()).substr(1);
  if (EXTENSIONS.indexOf(ext) == -1) {
    ext = null;
  }
  return ext;
};

module.exports = {
  getAddresses: getAddresses,
  getPackages: getPackages,
  getActiveExtension: getActiveExtension,
}
