"use strict";
var f = module.exports = {},
 mkdirp = require('mkdirp'),
 path = require("path"),
    fs = require("fs.extra"),
    config = require("./config.js"),
    terminal = require("window-size"),
    Ora = require("ora"),
    width = terminal.width / 2,
    divideLine = "─".repeat(width)


Array.prototype.contains = function(e) {
    for (var o = this.length; o--;)
        if (this[o].name === e) return !0;
    return !1
}, f.printDivideLine = function() {
    console.error(divideLine + "\n")
},  f.cd = function(e) {
    // config.debug = true;
    f.isDir(e) ? (config.debug && console.error("Changing directory to: " + e), process.chdir(e)) : mkdirp(e, function(err) {
        err && console.error(err), config.debug && console.error("Creating and Changing directory to: " + e), process.chdir(e)
    })
}, f.makeSpinner = function(e) {
    var o = new Ora({
        text: e
    });
    return o
}, f.isDir = function(e) {
    var o = process.cwd(),
        r = !1;
    try {
        process.chdir(e), r = !0
    } finally {
        return process.chdir(o), r
    }
}, f.b64encode = function(e) {
    return new Buffer(e).toString("base64")
}, f.b64decode = function(e) {
    return new Buffer(e, "base64").toString("utf8")
}, f.showHelp = function() {
    console.log("node apicia.js [--json] [--load <path>] [--help] "), console.log("--load <path> 		-	 Load Config from path"), console.log("--json|csv 			-	 print the response in JSON or CSV"), console.log("--help  		-	 this message"),console.log("--file  		-	 Save the output as a file")
};
String.prototype.boldsw = function(t) {
  if (t) {
    return t
  }
  else {
    return '';
  }
}
