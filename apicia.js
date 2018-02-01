"use strict";
var f = require("./lib/functions.js"),
    config = require("./lib/config.js"),
    getData = require("./lib/getData.js");
if (config.showHelp) f.showHelp();
else {
    var handleUserInput = require("./lib/handleUserInput.js"),
        processDir = require("./lib/processDir.js");
    handleUserInput(config, function() {
        getData(config, function(e) {
            processDir(e, config, function(e) {
                if (console.error("\nResults of analysis: "), f.printDivideLine(), "json" === config.output) console.log(JSON.stringify(e));
                else {
                    var i = require("json-hood");
                    i.printJSONasArrowDiagram(e)
                }
            })
        })
    })
}
