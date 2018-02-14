// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('./config.js'),
    API = require('../model/API.js'),
    Product = require('../model/Product.js'),
    Policy = require('../model/Policy.js'),
    Invoke = require('../model/InvokeURL.js'),
    InvokeMQ = require('../model/InvokeMQ.js');
var fet = require('foreachthen');

function parseYaml(file, catalog, callback) {
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
        results.product = new Product(jsonFile.info.name, jsonFile.info.version, jsonFile.info.title);
        results.product.tempPlans = jsonFile.plans;
        results.product.apis = jsonFile.apis;
        return callback(error, results);
    }
    var apiI = new API(apiName, version, apiTitle);
    results.api = (apiI);

    if (jsonFile['x-ibm-configuration'].assembly) {
        assembly = jsonFile['x-ibm-configuration'].assembly.execute;
    } else {

        return callback(error, results);
    }
    try {
        assembly.forEach(function(e) {
            examineYamlAssembly(e, jsonFile['x-ibm-configuration'], config.catalog, catalog, apiI, function() {
                examineYamlSecurity(jsonFile, assembly, catalog, apiI, callback);
            })
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

function examineYamlSecurity(e, assembly, catalog, apiI, cb) {

    if (e.securityDefinitions) {
        fet.ObjectForEachThen(e.securityDefinitions, function(callbackSub, p) {
            apiI.security[p] = {};
            if (e.securityDefinitions[p]) {
                apiI.security[p].type = e.securityDefinitions[p].type;
                if (e.securityDefinitions[p].type == 'oauth2') {
                    if (e.securityDefinitions[p].authorizationUrl) {
                        replaceVariables(e.securityDefinitions[p].authorizationUrl, assembly, catalog, function(resp) {
                            apiI.security[p].authorizationUrl = resp;
                        });
                    }
                    if (e.securityDefinitions[p].tokenUrl) {
                        replaceVariables(e.securityDefinitions[p].tokenUrl, assembly, catalog, function(resp) {
                            apiI.security[p].tokenUrl = resp;
                        });;
                    }
                    if (e.securityDefinitions[p]['x-tokenIntrospect']) {
                        replaceVariables(e.securityDefinitions[p]['x-tokenIntrospect'].url, assembly, catalog, function(resp) {
                            apiI.security[p].tokenIntrospect = resp;
                        });
                    }
                    callbackSub();
                } else {
                    callbackSub();
                }
            } else {
                callbackSub();
            }
        }, cb);
    } else {
        cb();
    }
}

function examineYamlAssembly(e, assembly, catalogA, catalog, apiI, callback) {
    fet.ObjectForEachThen(e, function(callbackSub, p) {
            if (p === 'mqinvoke') {
                replaceVariables(e.mqinvoke.queuemanager, assembly, catalog, function(resp) {
                    var queuemanager = resp;
                    replaceVariables(e.mqinvoke.queue, assembly, catalog, function(resp) {
                        var queue = resp;
                        apiI.invokes.push(new InvokeMQ(queuemanager, queue));
                    });
                });
            } else if (p === 'invoke') {
                var url = e.invoke['target-url'];
                if (url) {
                    replaceVariables(url, assembly, catalog, function(resp) {
                        apiI.invokes.push(new Invoke(resp));
                    });
                } else {
                    url = "NOT_SET"
                }
            } else if (p === 'proxy') {
                var url = e.proxy['target-url'];
                if (url) {
                    replaceVariables(url, assembly, catalog, function(resp) {
                        apiI.invokes.push(new Invoke(resp));
                    });
                } else {
                    url = "NOT_SET"
                }
            }
            apiI.policies.push(new Policy(p, e[p].version));

            if (p.execute) {
                examineYamlAssembly(p.execute, assembly, catalogA, catalog, results, function() {
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

function replaceVariables(url, assembly, catalog, cbResp) {
    url.split('$(').forEachThen(function(cb, i) {
        if (i.indexOf(')') > -1) {
            var key = i.substring(0, i.indexOf(')'));
            if (assembly.catalogs && assembly.catalogs[catalog] && assembly.catalogs[catalog].properties[key]) {
                url = url.replace("$(" + key + ")", assembly.catalogs[catalog].properties[key]);
                cb();
            } else if (assembly.properties && assembly.properties[key] && assembly.properties[key].value) {
                url = url.replace("$(" + key + ")", assembly.properties[key].value);
                cb();
            } else {
                cb();
            }
        } else {
            cb()
        }
    }, function() {
        if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
            url = 'http://' + url;
        }
        cbResp(url);
    });
}


module.exports = parseYaml;
