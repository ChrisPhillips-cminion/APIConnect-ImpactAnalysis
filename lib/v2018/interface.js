/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var printf = require('sprintf')
var exec = require("child_process").exec
var yaml = require("js-yaml");
var sleep = require('sleep').sleep;
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

    fet.ObjectForEachThen(config.catalog, function(cb, catalog) {
        var dispName = config.catalog[catalog]["displayName"];
        var catalogObj = new Catalog(catalog, dispName);
        toReturn.catalogs.push(catalogObj);

        var url = 'https://' + config.server + '/api/catalogs/' + config.organization + '/' + catalog + '/products';
        var suffix = "product";
        if (catalog == "drafts") {
            url = 'https://' + config.server + '/api/orgs/' + config.organization + '/drafts/draft-products';
            suffix = "draft_product";
        }
        var options = {
            url: url,
            headers: headers
        };
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        // var toReturn = [];
        request.get(options, function(err, response, body) {
            if (err) throw err;
            body = JSON.parse(body);
            console.log(options)

            body.results.forEachThen(function(cb, entry) {

                var urlE = url + '/' + entry.name + '/' + entry.version + '?fields=add%28' + suffix + '%2Curl%29'
                console.log(urlE);
                var product = new Product(entry.name, entry.version, entry.title);
                options.url = urlE;
                request.get(options, function(err, response, body) {
                    if (err) throw err;
                    body = JSON.parse(body);
                    var bodyP = body['product'];
                    if (body['draft_product'] != undefined) {
                        bodyP = body['draft_product'];
                    }
                    fet.ObjectForEachThen(bodyP.plans, function(cb, plan) {

                        var p = new Plan(plan.name, plan.title);
                        fet.ObjectForEachThen(bodyP.apis, function(cb, api) {
                          console.log(bodyP.apis[api])
                            p.apis.push(new API(bodyP.apis[api].name, " ", api));
                            cb();
                        }, function() {;
                            product.plans.push(p)
                            cb()
                        });

                    }, function() {
                        catalogObj.products.push( product);
                        // toReturn.push();

                        cb();
                    });
                });
            }, function() {
                cb();
            })
        });
    }, function() {
        console.log(toReturn)
        cb(toReturn);
    })
    //
    // var a = [];
    // Object.keys(o.catalog).forEachThen(function(cb, catalog) {
    //
    //         var r = path.join(o.applicationDirectory, ".cache", o.server, o.organization, catalog);
    //
    //         if (catalog == "drafts") {
    //             a.push(function(a) {
    //                 f.cd(r);
    //                 // console.error("Begin downloadYamlForProduct function for " + catalog);
    //                 var i = " draft-products:list-all  -s " + o.server + " --org  " + o.organization,
    //                     t = " draft-products:get prodname -s " + o.server + "  --debug --org " + o.organization;
    //
    //                 call(i, o, function(e, i) {
    //                     var c = i.toString().split("\n"),
    //                         s = [];
    //
    //                     c.splice(c.indexOf(""), 1), c.forEach(function(r) {
    //                         s.push(function(a) {
    //                             var e, i = r.split(/\ .*/)[0];
    //                             "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + catalog + ":" + i + " this may take a few minutes..."), e.start()), call(t.replace("prodname", i), o, function(n) {
    //                                 n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
    //                             }))
    //                         })
    //                     }), async.parallel(s, function(o) {
    //                         if (o) throw o;
    //                         a();
    //                     })
    //                 })
    //             })
    //             cb();
    //         } else {
    //             a.push(function(a) {
    //                 f.cd(r);
    //                 console.error("Begin downloadYamlForProduct function for " + catalog);
    //                 var i = "  products:list-all --scope catalog -s " + o.server + " -c " + catalog + " --org " + o.organization,
    //                     t = " products:get prodname --scope catalog -s " + o.server + " -c " + catalog + "  --org " + o.organization;
    //                 call(i, o, function(e, i) {
    //                     e ? (console.error(e), process.exit()) : i || console.error('No products were found in the organization "' + o.organization + '" and catalog "' + catalog + '".');
    //                     var c = i.toString().split("\n"),
    //                         s = [];
    //                     c.splice(c.indexOf(""), 1), c.forEach(function(r) {
    //                         s.push(function(a) {
    //                             var e, i = r.split(/\ .*/)[0];
    //                             "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + catalog + ":" + i + " this may take a few minutes..."), e.start()), call(t.replace("prodname", i), o, function(n) {
    //                                 n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
    //                             }))
    //                         })
    //                     }), async.parallel(s, function(o) {
    //                         if (o) throw o;
    //                         a();
    //                     })
    //                 })
    //             })
    //             cb();
    //         }
    //     },
    //     function() {;
    //         async.series(a, function(o) {
    //
    //             if (o) throw o;
    //             cb()
    //
    //         })
    //     });
}

function call(e, config, callback) {

    var apicpath = "/usr/local/bin/apic2018";

    config.debug && console.error("Begin call function with command: " + apicpath + e), exec(apicpath + " " + e, {}, function(e, r, n) {
        return e && r && (console.error("\n\n"), console.error(r.replace(f.b64decode(config.password), "***"))), callback(e, r, n);
    })
}

function getSubscriptions(catalog, config, callback) {

    var returnList = [];
    call(" consumer-orgs:list -o " + config.organization + " -s " + config.server + " -c " + catalog, config, function(a, i, t) {
        if (a) throw a;
        if (t) throw t;
        i.split(/\n/).forEachThen(function(cb, entry) {
                if (entry === "") {

                    cb();
                } else {

                    var corg = entry.split(/ /)[0]
                    call(" apps -o " + config.organization + " -s " + config.server + " -c " + catalog + " --consumer-org " + corg, config, function(a, i, t) {
                        if (a) throw a;
                        if (t) throw t;
                        i.split(/\n/).forEachThen(function(cb, entry) {
                            if (entry === "") {

                                cb();
                            } else {
                                var appName = entry.split(/ /)[0];
                                call(" subscriptions -o " + config.organization + " -s " + config.server + " -c " + catalog + " --consumer-org " + corg + "  --app  " + appName, config, function(a, i, t) {
                                    if (a) throw a;
                                    if (t) throw t;
                                    var resp = {}

                                    i.split(/\n/).forEachThen(function(cb, entry) {
                                        if (entry === "") {

                                            cb();
                                        } else {
                                            resp.appName = appName;

                                            resp.prod = entry.split(/ /)[0]
                                            resp.prodv = "1.0.0"
                                            resp.plan = "Default"
                                            returnList.push(resp);
                                            cb();
                                        }
                                    }, cb);

                                });
                            }
                        }, cb);

                    });
                }
            },
            function() {
                callback(returnList)
            }
        );
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


            //call("catalogs:list -s " + config.server + " --org " + config.organization, config, function(a, i, t) {

            toReturn.push(entry.title)
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
