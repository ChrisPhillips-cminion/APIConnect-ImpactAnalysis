"use strict";

function flagValue(e, s) {
    if (-1 !== process.argv.indexOf(e) || -1 !== process.argv.indexOf(s))
        if (-1 !== process.argv.indexOf(e))
            if (process.argv[process.argv.indexOf(e) + 1]) {
                if (!process.argv[process.argv.indexOf(e) + 1].match(/^\-/) && process.argv[process.argv.indexOf(e) + 1]) return process.argv[process.argv.indexOf(e) + 1];
                console.error('The flag: "' + e + '" requires a value.'), process.exit()
            } else console.error('The flag: "' + e + '" requires a value.'), process.exit();
    else if (process.argv[process.argv.indexOf(s) + 1]) {
        if (!process.argv[process.argv.indexOf(s) + 1].match(/^\-/) && process.argv[process.argv.indexOf(s) + 1]) return process.argv[process.argv.indexOf(e) + 1];
        console.error('The flag: "' + s + '" requires a value.'), process.exit()
    } else console.error('The flag: "' + s + '" requires a value.'), process.exit()
}

function isFlag(e) {
    return -1 !== process.argv.indexOf(e) ? !0 : !1
}
var fs = require("fs"),
    path = require("path"),
    validFlags = ["--help", "-h", "--load", "--json","--csv", "--debug", "--file"],
    homeDir = process.cwd(),
    config = {
        detailed: !1,
        tempfolder: "tmp",
        output: "console",
        catalog: {}
    };
if (isFlag("--load") || isFlag("-l")) {
    var loadPath = flagValue("--load", "-l");
    fs.existsSync(loadPath) ? (config = JSON.parse(fs.readFileSync(loadPath)), config.savePath = loadPath) : (console.error("The file specified for load at: " + loadPath + " could not be found, please try again."), process.exit())
} else config.savePath = void 0;
if ((isFlag("--help") || isFlag("-h")) && (config.showHelp = !0), (isFlag("--debug") || isFlag("-d")) && (config.debug = !0),isFlag("--csv") && (config.output = "csv"),  isFlag("--file") && (config.file = flagValue("--file")), isFlag("--json") && (config.output = "json"), isFlag("--save") || isFlag("-s")) {
    var savePath = flagValue("--save", "-s");
    config.savePath = path.join(homeDir, savePath)
}
process.argv.forEach(function(e, s) {
    2 > s || e.includes("-") && -1 === validFlags.indexOf(e) && (console.error("The arguement: " + e + " was not recognised."), config.showHelp = !0)
}), module.exports = config;
