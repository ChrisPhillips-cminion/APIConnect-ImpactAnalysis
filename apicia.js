"use strict";
var f = require("./lib/functions.js"),
    config = require("./lib/config.js"),
    getData = require("./lib/getData.js"),
    fet = require('foreachthen'),
    fs = require('fs')

if (config.showHelp) f.showHelp();
else {
    var handleUserInput = require("./lib/handleUserInput.js")

    handleUserInput(config, function() {
        getData(config, function(e) {
            f.printDivideLine()

            if (config.dataType.indexOf("Invokes and Proxies") > -1) {
                var processDir = undefined;
                processDir = require("./lib/processDir.js");
                //
                processDir(e, config, function(e) {
                    printOutput(config, e);
                })
            }
            if (config.dataType.indexOf("Security") > -1) {
                var processDir = undefined;
                processDir = require("./lib/processSecurity.js");
                processDir(e, config, function(e) {
                    printOutput(config, e);
                })
            }
            if (config.dataType.indexOf("Policies") > -1) {
                var processDir = undefined;
                processDir = require("./lib/processDirPolicy.js");
                processDir(e, config, function(e) {
                    printOutput(config, e);
                })
            }
        })
    })
}
//
var array = [];

function addEntry(obj, string, cb) {
    fet.ObejctForEachThenSeries(obj, function(cb2, entry, val, idx) {
        if (val == "No Products found") {
            cb2();
        } else {
            var stringNew = '';
            if (string === '') {
                stringNew = entry
            } else {
                stringNew = string + "," + entry
            }
            if (Object.keys(val).length != 0) {

                addEntry(val, stringNew, function() {
                    cb2();
                });
            } else {
                array.push(stringNew)
                // string = string + "," + val
                cb2();
            }
        }
    }, function() {
        // array.forEach(function(s) {
        // });
        cb();
    });
}

function printOutput(config, e) {

    console.error("Results of analysis: ")
    f.printDivideLine()

    if ("json" === config.output) {

        console.log(JSON.stringify(e).replace(new RegExp('.u001b.[0-9][0-9]?m', 'g'), ''))
        if (config.file) {
            fs.writeFile(config.file, e, function(err) {
                if (err) {
                    throw err;
                }
                console.log("File written to " + config.file)
            });
        }

    } else if ("csv" === config.output) {
        // var csv = json2csv({ data: e });
        var string = 'Catalog';
        config.displaySchema.forEach(function(s) {
            string = string + ',' + s;
        });

        addEntry(e, '', function() {
            array.forEach(function(s) {
                string = string + "\n" + s;
            });
        });
        console.log(string)
        if (config.file) {
            fs.writeFile(config.file, string, function(err) {
                if (err) {
                    throw err;
                }
                console.log("File written to " + config.file)
            });
        }
    } else {
        var i = require("json-hood");
        i.printJSONasArrowDiagram(e)
        if (config.file) {
            fs.writeFile(config.file, i.getJSONasArrowDiagram(e), function(err) {
                if (err) {
                    throw err;
                }
                console.log("File written to " + config.file)
            });
        }
    }
}
