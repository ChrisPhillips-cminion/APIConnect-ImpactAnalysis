// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
'use strict';
var f = require('./lib/functions.js');
var config = require('./lib/config.js');
var getData = require('./lib/getData.js');

if (config.showHelp) {

    /*
     *  This path shows the help text
     */
    f.showHelp();

} else {

    /*
     *  This path leads to the CLI experience, logic in ./lib
     */
    var handleUserInput = require('./lib/handleUserInput.js');
    var processDir = require('./lib/processDir.js');
    handleUserInput(config, function () {
        getData(config, function (org) {
            processDir(org, config.displaySchema, function (ServiceObj) {
                console.error('\nResults of analysis: ');
                f.printDivideLine();
                if (config.output === "json") {
                    console.log(JSON.stringify(ServiceObj));
                } else {
                    var arrowDiagram = require('json-hood');
                    arrowDiagram.printJSONasArrowDiagram(ServiceObj);
                }
            });
        });
    });
}
