/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var parseYaml = require('../parseYaml')
var request = require('request');
var fet = require('foreachthen'),
    Product = require("../../model/Product.js"),
    Plan = require("../../model/Plan.js"),
    Policy = require("../../model/Policy.js"),
    App = require("../../model/App.js"),
    Org = require("../../model/org.js"),
    API = require("../../model/API.js"),
    Catalog = require("../../model/Catalog.js")
/*
 * This function handles logging into an APIC MGMT server.
 *
 * @param {string} username - the username to login with
 * @param {string} password - the password to login with
 * @param {string} server - the server to login to
 * @param {function} callback - the function to execute upon completion
 *
 */


/* -X 'POST' -d '{"client_id":"599b7aef-8841-4ee2-88a0-84d49c4d6ff2","client_secret":"0ea28423-e73b-47d4-b40e-ddb45c48bb0c","grant_type":"password","password":"!n0r1t5@C","realm":"provider/default-idp-2","username":"chris.phillips@uk.ibm.com"} ' -H 'Accept: application/json' -H 'Accept-Language: en-GB' -H 'Content-Type: application/json' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c' 'https://apimdev0142.hursley.ibm.com/api/token'
 */



//curl -X 'POST' -d '{"client_id":"599b7aef-8841-4ee2-88a0-84d49c4d6ff2","client_secret":"0ea28423-e73b-47d4-b40e-ddb45c48bb0c","grant_type":"password","password":"!n0r1t5@C","realm":"provider/default-idp-2","username":"chris.phillips@uk.ibm.com"}'
//-H 'Accept: application/json' -H 'Accept-Language: en-GB' -H 'Content-Type: application/json' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
//'https://apimdev0142.hursley.ibm.com/api/token'
function apicLogin(username, password, server, config, callback) {
    if (!config.username || !password || !config.server || !config.realm) {
        throw new Error("Error: Missing parameters");
    }

    var payload = {
        "client_id": "599b7aef-8841-4ee2-88a0-84d49c4d6ff2",
        "client_secret": "0ea28423-e73b-47d4-b40e-ddb45c48bb0c",
        "grant_type": "password",
        "password": password,
        "realm": config.realm,
        "username": config.username
    };
    var headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB',
        'Content-Type': 'application/json',
        'User-Agent': 'Toolkit/a5860b286812634b80ffd731cc85257e842c3022',
        'X-Ibm-Client-Id': '599b7aef-8841-4ee2-88a0-84d49c4d6ff2',
        'X-Ibm-Client-Secret': '0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
    }

    var url = 'https://' + config.server + '/api/token';


    var options = {
        url: url,
        headers: headers,
        body: JSON.stringify(payload)
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


    request.post(options, function(err, response, body) {

        // var loginString = printf("login  -s " + config.server + " -u " + config.username + " -p '" + password + "' --realm " + config.realm);
        // call(loginString, config, function(err, stdout) {
        if (err) {
            throw err;
            console.error("ERR: " + err.toString().replace("--password " + password, "--password ******"));
        }

        body = JSON.parse(body);
        if (body['access_token'] != undefined) {
            config.accessToken = "Bearer " + body['access_token'];
            callback("Logged into")
        } else {

            throw new Error('Failed to login')
        }
    });
}

//curl -X 'GET' -H 'Accept: application/json' -H 'Accept-Language: en-GB' -H 'Authorization: Bearer token' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c' https://apimdev0142.hursley.ibm.com/api/orgs/'+config.organization+'/sandbox/products
//curl -X 'GET' -H 'Accept: application/yaml' -H 'Accept-Language: en-GB' -H 'Authorization: Bearer token' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c' 'https://apimdev0142.hursley.ibm.com/api/orgs/'+config.organization+'/drafts/draft-products/ads/1.0.0?fields=add%28draft_product%2Curl%29'
//https://apimdev0142.hursley.ibm.com/api/catalogs/'+config.organization+'/sandbox/products

function downloadYamlForProduct(config, cb) {


    var headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB',
        'Authorization': config.accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Toolkit/a5860b286812634b80ffd731cc85257e842c3022',
        'X-Ibm-Client-Id': '599b7aef-8841-4ee2-88a0-84d49c4d6ff2',
        'X-Ibm-Client-Secret': '0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
    }
    var toReturn = new Org(config.organization);

    fet.ObjectForEachThen(config.catalog, function(cb, cat) {
        var machineName = config.catalog[cat].machineName;
        var dispName = config.catalog[cat]["displayName"];
        var catalogObj = new Catalog(machineName, dispName);
        toReturn.catalogs.push(catalogObj);

        var url = 'https://' + config.server + '/api/catalogs/' + config.organization + '/' + machineName + '/products';
        var suffix = "product";
        if (machineName == "drafts") {
            url = 'https://' + config.server + '/api/orgs/' + config.organization + '/drafts/draft-products';
            suffix = "draft_product";
        }
        var options = {
            url: url,
            headers: headers
        };
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        // console.log(cat+" "+options)
        // var toReturn = [];
        request.get(options, function(err, response, body) {
            if (err) throw err;
            body = JSON.parse(body);

            body.results.forEachThen(function(cb, prod) {

                var urlE = url + '/' + prod.name + '/' + prod.version + '?fields=add%28' + suffix + '%2Curl%29'

                var product = new Product(prod.name, prod.version, prod.title);

                options.url = urlE;

                request.get(options, function(err, response, body) {
                    if (err) throw err;
                    body = JSON.parse(body);
                    var bodyP = body['product'];
                    if (body['draft_product'] != undefined) {
                        bodyP = body['draft_product'];
                    }
                    fet.ObjectForEachThen(bodyP.plans, function(cb, plan) {
                        var p = new Plan(plan, bodyP.plans[plan].title);
                        getSubscriptions(prod, p, cat, config, function() {
                            fet.ObjectForEachThen(bodyP.apis, function(cb, api) {
                                var apin = bodyP.apis[api].name;
                                var n = apin.split(':')[0]
                                var t = apin.split(':')[1]
                                getAPI(config, headers, apin, machineName, function(api) {
                                    // var apiI = new API(n, t, n);
                                    // apiI.invoke.push(new InvokeURL('asd'))
                                    // console.log(cat+" "+entry.name+" "+plan+" "+n+" "+JSON.stringify(p)+" "+JSON.stringify(api))
                                    p.apis.push(api);
                                    cb();
                                    // console.log(cat+" "+JSON.stringify(p))
                                });

                            }, function() {;
                                product.plans.push(p)
                                cb()
                            });
                        })
                    }, function() {
                        catalogObj.products.push(product);
                        // toReturn.push();
                        cb();
                    });
                });
            }, function() {
                cb();
            })
        });
    }, function() {
        cb(toReturn);
    })
}



function getSubscriptions(prod, planObj, catalog, config, cb) {

        var headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB',
            'Authorization': config.accessToken,
            'Content-Type': 'application/json',
            'User-Agent': 'Toolkit/a5860b286812634b80ffd731cc85257e842c3022',
            'X-Ibm-Client-Id': '599b7aef-8841-4ee2-88a0-84d49c4d6ff2',
            'X-Ibm-Client-Secret': '0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
        }

        //https://apicplatform.18.224.80.149.nip.io/api/catalogs/chris-org/sandbox/consumer-orgs

        var url = 'https://' + config.server + '/api/catalogs/' + config.organization + '/' + config.catalog[catalog].machineName + '/consumer-orgs';

        var options = {
            url: url,
            headers: headers
        };
        var toReturn = [];

        request.get(options, function(err, response, body) {
            ///api/apps/chris-org/sandbox/sandbox-test-org/sandbox-test-app/subscriptions/newasda
            body = JSON.parse(body);
            // console.log(body)
            // https://apicplatform.18.224.80.149.nip.io/api/consumer-orgs/chris-org/sandbox/safdsa/apps
            if (body.results) {
                // console.log("!!"+body.results[0].name)
                body.results.forEachThen(function(cb, consumerorg) {

                    url = 'https://' + config.server + '/api/consumer-orgs/' + config.organization + '/' + config.catalog[catalog].machineName + '/' + consumerorg.name + '/apps';
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

                    var toReturn = [];

                    var options = {
                        url: url,
                        headers: headers
                    };
                    request.get(options, function(err, response, body) {
                        ///api/apps/chris-org/sandbox/sandbox-test-org/sandbox-test-app/subscriptions/newasda
                        body = JSON.parse(body);
                        body.results.forEachThen(function(cb, app) {
                            var app = new App(app.name, app.title);
                            url = 'https://' + config.server + '/api/apps/' + config.organization + '/' + config.catalog[catalog].machineName + '/' + consumerorg.name + '/' + app.name + '/subscriptions';
                            var options = {
                                url: url,
                                headers: headers
                            };
                            request.get(options, function(err, response, body) {
                                // console.log(body)
                                body = JSON.parse(body)
                                if (body.results) {
                                    body.results.forEachThen(function(cb, sub) {
                                        if (sub['product_url'] === prod.url) {

                                            planObj.apps.push(app)
                                            cb();
                                        } else {
                                            cb();
                                        }
                                    }, function() {
                                        cb();
                                    })
                                } else {
                                    cb();
                                }
                            });
                        }, function() {
                            cb();
                        });

                    });
                }, function() {

                    cb();
                });
            } else { cb() }
        });

}

function getCatalog(r, config, cb) {
    cb(lookUp[r]);
}
//curl -X 'GET'
//-H 'Accept: application/yaml' -H 'Accept-Language: en-GB' -H 'Authorization: Bearer ' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
//'https://apimdev0142.hursley.ibm.com/api/orgs/'+config.organization+'/catalogs'

var lookUp = {};

function getCatalogs(config, cb) {


    var headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB',
        'Authorization': config.accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Toolkit/a5860b286812634b80ffd731cc85257e842c3022',
        'X-Ibm-Client-Id': '599b7aef-8841-4ee2-88a0-84d49c4d6ff2',
        'X-Ibm-Client-Secret': '0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
    }

    var url = 'https://' + config.server + '/api/orgs/' + config.organization + '/catalogs';


    var options = {
        url: url,
        headers: headers
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var toReturn = [];
    request.get(options, function(err, response, body) {
        if (err) throw err;
        body = JSON.parse(body);
        body.results.forEachThen(function(cb, entry) {
            toReturn.push(entry.name)
            lookUp[entry.name] = entry.title;
            cb();
        }, function() {
            cb(toReturn);
        })
    });
}

//curl -X 'GET' -H 'Accept: application/yaml' -H 'Accept-Language: en-GB' -H 'Authorization: Bearer token' -H 'User-Agent: Toolkit/a5860b286812634b80ffd731cc85257e842c3022' -H 'X-Ibm-Client-Id: 599b7aef-8841-4ee2-88a0-84d49c4d6ff2' -H 'X-Ibm-Client-Secret: 0ea28423-e73b-47d4-b40e-ddb45c48bb0c' 'https://apimdev0142.hursley.ibm.com/api/cloud/orgs'
function getOrganization(config, cb) {
    var headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB',
        'Authorization': config.accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Toolkit/a5860b286812634b80ffd731cc85257e842c3022',
        'X-Ibm-Client-Id': '599b7aef-8841-4ee2-88a0-84d49c4d6ff2',
        'X-Ibm-Client-Secret': '0ea28423-e73b-47d4-b40e-ddb45c48bb0c'
    }

    var url = 'https://' + config.server + '/api/orgs';


    var options = {
        url: url,
        headers: headers
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var toReturn = [];
    request.get(options, function(err, response, body) {
        if (err) throw err;
        body = JSON.parse(body);
        body.results.forEachThen(function(cb, entry) {
            toReturn.push(entry.name)
            // lookUp[entry.title] = entry.name;
            cb();
        }, function() {
            cb(toReturn);
        })
    });


}
var f = require("../functions.js"),
    async = require("async"),
    path = require("path");
module.exports.apicLogin = apicLogin;
module.exports.getSubscriptions = getSubscriptions;
module.exports.downloadYamlForProduct = downloadYamlForProduct;
module.exports.getOrganization = getOrganization;
module.exports.getCatalogs = getCatalogs;
module.exports.getCatalog = getCatalog;


function getAPI(config, headers, api, catalog, cb) {
    var n = api.split(':')[0];
    var v = api.split(':')[1];

    var url = 'https://' + config.server + '/api/catalogs/' + config.organization + '/' + catalog + '/apis/' + n + '/' + v + '?fields=add%28wsdl%2Capi%29';
    var key = 'api';
    if (catalog == "drafts") {
        url = 'https://' + config.server + '/api/orgs/' + config.organization + '/drafts/draft-apis/' + n + '/' + v + '?fields=add%28wsdl%2Cdraft_api%29';
        var key = 'draft_api';
    }
    var options = {
        url: url,
        headers: headers
    };
    request.get(options, function(err, response, body) {

        parseYaml(JSON.parse(body)[key], catalog, function(error, results) {
            cb(results.api);
        })
    });
}
