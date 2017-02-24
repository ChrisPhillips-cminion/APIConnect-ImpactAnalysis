/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var fs = require('fs.extra');
var f = require('./functions.js');
var async = require('async');

function downloadYamlForProduct(config, callbackParent) {
    var root_dir = process.cwd() + '/' + config.tempfolder,
        calls = [];
    // Create the directory (or switch to dir) to dump yaml into
    f.cd(root_dir);

    Object.keys(config.catalog).forEach(function (cat) {
        calls.push(function (callbackchild) {


            f.cd(root_dir + '/' + cat);


            console.error('Begin downloadYamlForProduct function for ' + cat);

            var prodList = 'apic products -s ' + config.server + ' -c ' + cat + ' --organization ' + config.organization,
                pullYaml = 'apic products:pull prodname  -s ' + config.server + ' -c ' + cat + '  --organization ' + config.organization;
            f.call(prodList, function (err, stdout) {
                if (err) {
                    console.error(err);
                    process.exit();
                } else if (!stdout) {
                    console.error('No products were found in the organization ("' + config.organization + '") and catalog ("' + cat + '").');
                }
                var lines = stdout.toString().split('\n'),
                    callsLines = [];
                lines.splice(lines.indexOf(''), 1);
                lines.forEach(function (line) {
                    callsLines.push(function (callback) {
                        var prodname = line.split(' in ')[0],
                            spinner;
                        if (prodname !== '') {
                            if (!config.debug) {
                                spinner = f.makeSpinner('Downloading Product ' + cat + ':' + prodname + ' this may take a few minutes...');
                                spinner.start();
                            }
                            f.call(pullYaml.replace('prodname', prodname), function (err) {
                                if (err) {
                                    console.error(err);
                                    if (!config.debug) {
                                        spinner.fail();
                                    }
                                } else {
                                    if (!config.debug) {
                                        spinner.succeed();
                                    }
                                    // Log the output and move to processing

                                    callback();

                                }
                            });
                        }
                    });
                });
                async.parallel(callsLines, function (err) {
                    /* this code will run after all calls finished the job or
                    when any of the calls passes an error */
                    if (err) {
                        throw err;
                    }
                    f.cd(root_dir + '/..');
                    callbackchild();
                });

            });
        });
    });

    async.series(calls, function (err) {
        /* this code will run after all calls finished the job or
        when any of the calls passes an error */
        if (err) {
            throw err;
        }
        callbackParent();
    });
}
module.exports = downloadYamlForProduct;
