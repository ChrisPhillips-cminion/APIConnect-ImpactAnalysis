// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('./config.js');

var fet = require('foreachthen');

function parseYaml(file,catalog, callback) {
    var error = null,

        jsonFile = yaml.safeLoad(fs.readFileSync(file, 'utf8')),
        apiName = jsonFile.info['x-ibm-name'],
        apiTitle = jsonFile.info.title,
        version = jsonFile.info.version,
        results = {
            apis: undefined,
            products: {}
        },
        assembly,
        holder,
        url;
    if (jsonFile.apis == undefined) {
        jsonFile.apis = {};
    }
    // Check if it's a product and return early if so
    if (jsonFile.product) {
        results.products = {
            name: jsonFile.info.name,
            title: jsonFile.info.title,
            version: jsonFile.info.version,
            plans: jsonFile.plans,
            apis: jsonFile.apis
        };

        return callback(error, results);
    }
    holder = {
        'apiname': apiName,
        'version': version,
        'title': apiTitle,
        'service': [],
        'policy': [],
        'qm': []
    };
    results.apis = holder;
    if (jsonFile['x-ibm-configuration'].assembly) {
        assembly = jsonFile['x-ibm-configuration'].assembly.execute;
    } else {

        return callback(error, results);
    }
    try {
        assembly.forEach(function(e) {
            // console.log(e)
            examineYaml(e, jsonFile['x-ibm-configuration'], config.catalog,catalog, results, callback)
        });
    } catch (exception) {
        error = exception;
        console.error(exception);
        throw exception;
    } finally {
        if (config.debug) {
            console.error('ParseYAML.js returns: ' + JSON.stringify(results, {}, 2));
        }
        return callback(error, results);
    }
}

function examineYaml(e, assembly, catalogA, catalog, results, callback) {
    fet.ObjectForEachThen(e, function(callbackSub, p) {
            if (p === 'mqinvoke') {
                var svc = {
                    'queuemanager': e.mqinvoke.queuemanager,
                    'requestqueue': e.mqinvoke.queue,
                    'replyqueue': e.mqinvoke.replyqueue,
                    'backoutqueue': e.mqinvoke.backoutq
                };
                results.apis.qm.push(svc);
            } else if (p === 'invoke') {
                var url = e.invoke['target-url'];
                    url.split('$(').forEachThen(function(cb,i) {
                        if (i.indexOf(')') > -1) {
                            var key = i.split(/\)/)[0]

                            if (assembly.catalogs && assembly.catalogs[catalog] && assembly.catalogs[catalog].properties[key]) {
                                url = url.replace("$(" + key + ")", assembly.catalogs[catalog].properties[key])
                                cb();

                            } else if (assembly.properties && assembly.properties[key].value) {
                                url =  url.replace("$(" + key + ")", assembly.properties[key].value)
                                cb();
                            }
                            else {
                              cb();
                            }

                        } else { cb() }
                    }, function() {
                      if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
                          url = 'http://' + url;
                      }
                      results.apis.service.push(url);
                    });


            } else if (e.proxy !== undefined) {
                var url = e.proxy['target-url'];
                if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
                    url = 'http://' + url;
                }
                results.apis.service.push(url);
            } else {
                results.apis.policy.push({
                    'name': p,
                    'version': e[p].version
                })
            }
            if (p.execute) {
                examineYaml(p.execute, assembly, catalogA,catalog, results, function() {
                    callbackSub();
                });
            } else {
                callbackSub()
            }
        },
        function() {
            callback();
        });
}


module.exports = parseYaml;
