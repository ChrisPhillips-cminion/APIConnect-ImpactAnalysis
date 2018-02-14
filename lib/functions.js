"use strict";
var f = module.exports = {},
    exec = require("child_process").exec,
    fs = require("fs.extra"),
    config = require("./config.js"),
    terminal = require("window-size"),
    Ora = require("ora"),
    width = terminal.width / 2,
    divideLine = "─".repeat(width),
    apicLogin = require("./apicLogin");
Array.prototype.contains = function(e) {
    for (var o = this.length; o--;)
        if (this[o].name === e) return !0;
    return !1
}, f.printDivideLine = function() {
    console.error(divideLine + "\n")
}, f.call = function(e, o) {
    config.debug && console.error(e.includes("password") ? "This f.call command has not been logged as it contains password information" : "Begin f.call function with command: " + e), exec(e, {}, function(e, r, n) {
        return e && r && (console.error("\n\n"), console.error(r.replace(f.b64decode(config.password), "***"))), o(e, r, n)
    })
}, f.cd = function(e) {

    f.isDir(e) ? (config.debug && console.error("Changing directory to: " + e), process.chdir(e)) : fs.mkdir(e, function(o) {
        o && console.error(o), config.debug && console.error("Changing directory to: " + e), process.chdir(e)
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
}, f.apicLogin = function(e, o) {
    var r = f.makeSpinner("Logging in...");
    e.debug ? console.error("Begin apicLogin function") : r.start(), apicLogin(e.username, f.b64decode(e.password), e.server, function(e) {
        return e.match(/^Logged into/) ? (r.succeed(), o()) : (r.fail(), void console.error(new Error("Failed to log into APIC, please see previous error message for details")))
    })
}, f.b64encode = function(e) {
    return new Buffer(e).toString("base64")
}, f.b64decode = function(e) {
    return new Buffer(e, "base64").toString("utf8")
}, f.showHelp = function() {
    console.log("node apicia.js [--json] [--load <path>] [--help] "), console.log("--load <path> 		-	 Load Config from path"), console.log("--json|csv 			-	 print the response in JSON or CSV"), console.log("--help  		-	 this message"),console.log("--file  		-	 Save the output as a file")
};
String.prototype.boldsw = function(t) {
  if (t) {
    return this.bold
  }
  else {
    return '';
  }
}
