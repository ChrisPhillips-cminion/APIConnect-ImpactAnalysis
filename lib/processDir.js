/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
/*jshint node:true */
'use strict';
var f = require('./functions.js');
var fet = require('foreachthen');

function process(callback, output, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app) {
    var prodVar = 'Product - ' + product.title + ' : ' + product.version,
        planVar = 'Plan - ' + plan.title,
        apiVar = 'API - ' + api.title + ' : ' + api.version + ' ('+api.basepath+')',
        appVar,
        service1,
        service2,
        schema = {};
    if (app !== undefined) {
        appVar = 'Application - ' + app;
    }
    if (invoke) {
        if (invoke.type === 'mq') {
            service1 = 'Service QueueManager - ' + invoke.qm;
            service2 = 'Service Queue - ' + invoke.q;
        } else if (invoke.type === 'http') {
            service1 = 'Service Host - ' + invoke.url.protocol + "//" + invoke.url.host;
            service2 = 'Service ContextRoute - ' + invoke.url.pathname;
            if (invoke.url.pathname.startsWith('/$(target-url)$(request.path)')) {
                service1 = 'Service Host -' + ' $(target-url)';
                service2 = 'Service ContextRoute -' + ' $(request.path)';
            }
        }
    }
    fet.ObjectForEachThen(displaySchema, function(cb, entry, val, idx) {
            if (val === 'Policy / Service Details 1') {
                schema['a' + idx] = service1;
            } else if (val === 'Policy / Service Details 2') {
                schema['a' + idx] = service2;
            } else if (val === 'API') {
                schema['a' + idx] = apiVar;
            } else if (val === 'Product') {
                schema['a' + idx] = prodVar;
            } else if (val === 'Plan') {
                schema['a' + idx] = planVar;
            } else if (val === 'Application') {
                schema['a' + idx] = appVar;
            } else {
                schema['a' + idx] = 'Did not recognise : ' + val;
            }
            cb();
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

function processDir(parentOrg, config, callback) {

    var header = true;
    if (config.output == 'csv') {
        header = false;
    }
    var displaySchema = config.displaySchema;
    var ServiceObj = {};

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
	                        if (api.invokes.length != 0) {
        	                    api.invokes.forEachThen(function(callback, invoke) {
                		                if (plan.apps.length === 0) {
                                	    process(function() {
                                        	callback();
	                                    }, header, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName);
        	                        } else {
                	                    plan.apps.forEachThen(function(callback, app) {
                        	                process(function(sobj) {
                                	            ServiceObj = sobj;
                                        	    callback();
	                                        }, header, invoke, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app.name);
        	                            }, callback);
                	                }
                        	    }, callback);
	                        } else {	
        	                    if (plan.apps.length === 0) {
                	                process(function() {
                        	            callback();
                                	}, header, undefined, api, plan, product, displaySchema, ServiceObj, catalogDisplayName);
	                            } else {
        	                        plan.apps.forEachThen(function(callback, app) {
                	                    process(function(sobj) {
                        	                ServiceObj = sobj;
                                	        callback();
	                                    }, header, undefined, api, plan, product, displaySchema, ServiceObj, catalogDisplayName, app.name);
        	                        }, callback);
                            }
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
