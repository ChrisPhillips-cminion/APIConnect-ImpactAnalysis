// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
// Data model
var Org = require('../model/Org.js');
var InvokeURL = require('../model/InvokeURL.js');
var InvokeMQ = require('../model/InvokeMQ.js');
var API = require('../model/API.js');
var Product = require('../model/Product.js');
var Plan = require('../model/Plan.js');
var App = require('../model/App.js');
var Catalog = require('../model/Catalog.js');
var path = require('path');
// Scripts
var downloadYamlForProduct = require('./downloadYamlForProduct.js');
var parseYaml = require('./parseYaml.js');
var async = require('async');
var forEachThen = require('foreachthen');
var f = require('./functions.js')

// Dependancies
var yaml = require('js-yaml');
var fs = require('fs.extra');

function getData(config, callback) {
    function getSubscriptions(tempAppList, cat, callback) {
        f.call('apic subscriptions -c ' + cat + ' --server ' + config.server + ' --organization ' + config.organization, function(err, stdout, stderr) {
            if (err) {
                console.error(err);
                throw err;
            }
            if (stderr) {
                console.error(stderr);
                throw stderr;
            }

            stdout.toString().split('\n').forEachThen(function(callback, line) {
                if (line !== "") {
                    var appName = line.split(" ")[2],
                        prod_v_plan = line.split(" ")[4].toString(),
                        prod = prod_v_plan.split(':')[0],
                        prodv = prod_v_plan.split(':')[1],
                        plan = prod_v_plan.split(':')[2],
                        app = new App(appName);
                    if (tempAppList[prod] === undefined) {
                        tempAppList[prod] = {};
                    }
                    if (tempAppList[prod][prodv] === undefined) {
                        tempAppList[prod][prodv] = {};
                    }
                    if (tempAppList[prod][prodv][plan] === undefined) {
                        tempAppList[prod][prodv][plan] = [];
                    }
                    tempAppList[prod][prodv][plan].push(app);
                }
                callback();
            }, callback);

        });
    }

    function processProduct(tempAppList, tempAPIList, tempProductList, catObj, callback) {
        var product;
        tempProductList.forEachThen(function(callback, prod) {
            product = new Product(prod.name, prod.version, prod.title);
            for (var keyProd in prod.plans) {
                var planObj = new Plan(keyProd, prod.plans[keyProd].title);
                if ((tempAppList[prod.name] != undefined) && (tempAppList[prod.name][prod.version] != undefined)) {
                    planObj.apps = tempAppList[prod.name][prod.version][planObj.name];
                }
                var keyArray = Object.keys(prod.apis);
                keyForEachThen(keyArray, planObj, product, tempAPIList, prod);
            }
            catObj.products.push(product);
            callback();
        }, callback);
    }

    function keyForEachThen(array, planObj, product, tempAPIList, prod) {
        array.forEachThen(function(callback, key) {
            planObj.apis.push(tempAPIList[prod.apis[key].$ref]);
            callback();
        }, function() {
            product.plans.push(planObj);
        });
    }
    var org = new Org(config.organization);
    downloadYamlForProduct(config, function() {
        var catCalls = [],
            commands = [];
        Object.keys(config.catalog).forEachThen(
            function(callbackP, cat) {
                var tempAPIList = {},
                    tempAppList = {},
                    tempProductList = [],
                    tempProductListtempAppList = {},
                    tempProductListcommands = [];
                commands.push(function(callback) {
                    getSubscriptions(tempAppList, cat, callback);
                });
                commands.push(function(callbackpp) {
                    //get Catalog displayName
                    f.call('apic catalogs:get ' + cat + ' --server ' + config.server + ' --organization ' + config.organization, function(err, stdout, stderr) {
                        if (err) {
                            console.error(err);
                            throw err;
                        } else if (stderr) {
                            console.error(stderr);
                            throw stderr;
                        } else {
                            var jsonFile = yaml.safeLoad(stdout);
                            var displayName = jsonFile['display name'];
                            var catObj = new Catalog(cat, displayName);
                            org.catalogs.push(catObj);
                            fs.readdir(path.join( config.tempfolder, cat), function(err, files) {
                                var calls = [];
                                files.forEachThen(
                                    function(callback, file) {
                                        parseYaml(path.join(config.tempfolder , cat  , file), function(err, results) {
                                            var iurl;
                                            if (results != undefined) {


                                                if ((results.apis != undefined) && (results.apis != {})) {
                                                    var api = new API(results.apis.apiname, results.apis.version, results.apis.title);
                                                    results.apis.service.forEach(function(svc) {
                                                        if (results.apis.service) {
                                                            iurl = new InvokeURL(svc);
                                                            api.invokes.push(iurl);
                                                        }
                                                    });
                                                    results.apis.qm.forEach(function(svc) {
                                                        iurl = new InvokeMQ(svc.queuemanager, svc.requestqueue);
                                                        api.invokes.push(iurl);
                                                    });
                                                    tempAPIList[file] = api;
                                                } else if (results.products.plans != undefined) {
                                                    tempProductList.push(results.products);
                                                }
                                            }
                                        });
                                        callback();
                                    },
                                    function() {
                                        processProduct(tempAppList, tempAPIList, tempProductList, catObj, function() {
                                            callbackpp();
                                        });
                                    });
                            });
                        }
                    });
                });
                async.series(commands, function(err, result) {
                    console.error("Processing Complete for " + cat);
                    callbackP();
                });
            },
            function(err, result) {

                callback(org);
                if (!err) {
                  fs.removeSync(config.tempfolder);
                }
            });
    });
}
module.exports = getData;
