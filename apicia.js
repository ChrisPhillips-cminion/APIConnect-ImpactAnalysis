"use strict";
var f = require("./lib/functions.js"),
    config = require("./lib/config.js"),
    getData = require("./lib/getData.js");
if (config.showHelp) f.showHelp();
else {
    var handleUserInput = require("./lib/handleUserInput.js")

    handleUserInput(config, function() {
        getData(config, function(e) {
            f.printDivideLine()

            if (config.dataType.indexOf("Invokes and Proxies") > -1) {
var processDir = undefined;
                processDir = require("./lib/processDir.js");
                processDir(e, config, function(e) {
                    if (console.error("Results of Invoke/Proxy analysis: "), f.printDivideLine(), "json" === config.output) console.log(JSON.stringify(e));
                    else {
                        var i = require("json-hood");
                        i.printJSONasArrowDiagram(e)
                    }
                })
            }
            if (config.dataType.indexOf("Security") > -1) {
var processDir = undefined;
                processDir = require("./lib/processSecurity.js");
                processDir(e, config, function(e) {
                    if (console.error("Results of Security analysis: "), f.printDivideLine(), "json" === config.output) console.log(JSON.stringify(e));
                    else {
                        var i = require("json-hood");
                        i.printJSONasArrowDiagram(e)
                    }
                })
            }
            if (config.dataType.indexOf("Policies") > -1) {
var processDir = undefined;
                processDir = require("./lib/processDirPolicy.js");
                processDir(e, config, function(e) {
                    if (console.error("Results of Policy analysis: "), f.printDivideLine(), "json" === config.output) console.log(JSON.stringify(e));
                    else {
                        var i = require("json-hood");
                        i.printJSONasArrowDiagram(e)
                    }
                })
            }
        })
    })
}
