/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
/*jshint node:true */
'use strict';
var f = require('./functions.js');
var async = require('async');
var isJSON = require('is-json');
require('foreachthen');

function process(callback, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app) {

    if (invoke) {
        // console.error(invoke)
        var prodVar = 'Product - ' + product.title + ' : ' + product.version,
            planVar = 'Plan - ' + plan.title,
            apiVar = 'API - ' + api.title + ' : ' + api.version,
            appVar,
            service1,
            service2,
            schema = {};
        if (app !== undefined) {
            appVar = 'Application - ' + app;
        }

        if (invoke.type === 'mq') {
            service1 = invoke.qm;
            service2 = invoke.q;
        } else if (invoke.type === 'http') {

            service1 = invoke.url.host;
            service2 = invoke.url.pathname;
            if (invoke.url.pathname.startsWith('/$(target-url)$(request.path)')) {
                service1 = '$(target-url)';
                service2 = '$(request.path)';
            }
        }

        displaySchema.forEachThen(
            function (cb, entry, idx) {
                if (entry === 'Service - Server / QueueManager') {
                    schema['a' + idx] = service1;
                } else if (entry === 'Service - ContextRoute / Queue') {
                    schema['a' + idx] = service2;
                } else if (entry === 'API') {
                    schema['a' + idx] = apiVar;
                } else if (entry === 'Product') {
                    schema['a' + idx] = prodVar;
                } else if (entry === 'Plan') {
                    schema['a' + idx] = planVar;
                } else if (entry === 'Application') {
                    schema['a' + idx] = appVar;
                } else {
                    schema['a' + idx] = 'Did not recognise ' + entry;
                }
                cb();
                // console.error(schema);
            },
            function () {
                if ((schema.a0 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0] = {};
                }
                if ((schema.a0 !== undefined) && (schema.a1 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0][schema.a1] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0][schema.a1] = {};
                }
                if ((schema.a0 !== undefined) && (schema.a1 !== undefined) && (schema.a2 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2] = {};
                }
                if ((schema.a0 !== undefined) && (schema.a1 !== undefined) && (schema.a2 !== undefined) && (schema.a3 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3] = {};
                }
                if ((schema.a0 !== undefined) && (schema.a1 !== undefined) && (schema.a2 !== undefined) && (schema.a3 !== undefined) && (schema.a4 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3][schema.a4] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3][schema.a4] = {};
                }
                if ((schema.a0 !== undefined) && (schema.a1 !== undefined) && (schema.a2 !== undefined) && (schema.a3 !== undefined) && (schema.a4 !== undefined) && (schema.a5 !== undefined) && (ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3][schema.a4][schema.a5] === undefined)) {
                    ServiceObj[catalogDisplayName][schema.a0][schema.a1][schema.a2][schema.a3][schema.a4][schema.a5] = {};
                }
                // console.error(ServiceObj);
                callback(ServiceObj);
            }
        );
    } else {
        callback(ServiceObj);
    }
}

function processDir(parentOrg, displaySchema, callback) {
    var ServiceObj = {};
    // arrowDiagram.printJSONasArrowDiagram(parentOrg)
    parentOrg.catalogs.forEachThen(
        function (callback, catalog) {
            var catalogDisplayName = catalog.displayName;
            if (catalog.products.length === 0) {
                ServiceObj[catalogDisplayName] = 'No Products found';
            } else {
                ServiceObj[catalogDisplayName] = {};
            }

            catalog.products.forEachThen(function (callback, product) {
                product.plans.forEachThen(function (callback, plan) {
                    plan.apis.forEachThen(function (callback, api) {
                        api.invokes.forEachThen(function (callback, invoke) {
                            if (plan.apps.length === 0) {
                                process(function () {
                                    callback();
                                }, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName);
                            } else {
                                plan.apps.forEachThen(function (callback, app) {
                                    process(function (sobj) {
                                        ServiceObj = sobj;
                                        callback();
                                    }, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app.name);
                                }, callback);
                            }
                        }, callback);
                    }, callback);
                }, callback);
            }, callback);
        },
        function (err) {
            /* this code will run after all calls finished the job or
                       when any of the calls passes an error */
            if (err) {
                throw err;
            }
            callback(ServiceObj);
        }
    );
}
module.exports = processDir;
