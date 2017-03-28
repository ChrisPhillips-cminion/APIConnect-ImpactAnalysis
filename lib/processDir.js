// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
/*jshint node:true */
'use strict';
var f = require('./functions.js');
var async = require('async');
var isJSON = require('is-json');
var colors = require('colors');
require('foreachthen');

function process(callback, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app) {


    // console.error(invoke)
    var prodVar = 'Product - '.bold + product.title + ' : ' + product.version,
        planVar = 'Plan - '.bold + plan.title,
        apiVar = 'API - '.bold + api.title + ' : ' + api.version,
        appVar,
        service1,
        service2,
        schema = {};
    if (app !== undefined) {
        appVar = 'Application - '.bold + app;
    }
    if (invoke.type === 'mq') {
        service1 = 'Service QueueManager - '.bold + invoke.qm;
        service2 = 'Service Queue - '.bold + invoke.q;
    } else if (invoke.type === 'http') {

        service1 = 'Service Host - '.bold + invoke.url.protocol + "//" + invoke.url.host;
        service2 = 'Service ContextRoute - '.bold + invoke.url.pathname;
        if (invoke.url.pathname.startsWith('/$(target-url)$(request.path)')) {
            service1 = 'Service Host -'.bold + ' $(target-url)';
            service2 = 'Service ContextRoute -'.bold + ' $(request.path)';
        }
    }
    displaySchema.forEachThen(
        function(cb, entry, idx) {
            if (entry === 'Service - Host / QueueManager') {
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
                schema['a' + idx] = 'Did not recognise : '.bold + entry;
            }
            cb();
            // console.error(schema);
        },
        function() {
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
}

function processDir(parentOrg, displaySchema, callback) {
    var ServiceObj = {};
    // arrowDiagram.printJSONasArrowDiagram(parentOrg)
    parentOrg.catalogs.forEachThen(
        function(callback, catalog) {
            var catalogDisplayName = catalog.displayName;
            if (catalog.products.length === 0) {
                ServiceObj[catalogDisplayName] = 'No Products found';
            } else {
                ServiceObj[catalogDisplayName] = {};
            }

            catalog.products.forEachThen(function(callback, product) {
                product.plans.forEachThen(function(callback, plan) {
                    plan.apis.forEachThen(function(callback, api) {
                        if (api.invokes != []) {
                            api.invokes.forEachThen(function(callback, invoke) {
                                if (plan.apps.length === 0) {
                                    process(function() {
                                        callback();
                                    }, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName);
                                } else {
                                    plan.apps.forEachThen(function(callback, app) {
                                        process(function(sobj) {
                                            ServiceObj = sobj;
                                            callback();
                                        }, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app.name);
                                    }, callback);
                                }
                            }, callback);
                        } else {
                            if (plan.apps.length === 0) {
                                process(function() {
                                    callback();
                                },undefined , api, plan, product, displaySchema, ServiceObj, catalogDisplayName);
                            } else {
                                plan.apps.forEachThen(function(callback, app) {
                                    process(function(sobj) {
                                        ServiceObj = sobj;
                                        callback();
                                    },undefined , api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app.name);
                                }, callback);
                            }
                            callback();
                        }
                    }, callback);
                }, callback);
            }, callback);
        },
        function(err) {
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
