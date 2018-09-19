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
/*
 * This function handles logging into an APIC MGMT server.
 *
 * @param {string} username - the username to login with
 * @param {string} password - the password to login with
 * @param {string} server - the server to login to
 * @param {function} callback - the function to execute upon completion
 *
 */

function apicLogin(username, password, server, config, callback) {
    if (!username || !password || !server) {
        return callback("Error: Missing parameters");
    }


    var loginString = printf('login --username "%s" --password "%s" --server "%s"', username, password, server);
    call(loginString, config, function(err, stdout) {
        if (err) {
            console.error("ERR: " + err.toString().replace("--password " + password, "--password ******"));
        }
        return callback(stdout);
    });
}


function execute_cli(loginString, cb) {

    var apicpath = path.join(config.applicationDirectory, 'node_modules', '.bin', 'apic ');
    if (config.debug) {
        if (e.includes("password")) {
            console.debug("This call command has not been logged as it contains password information")
        } else {
            console.debug("Begin call function with command: " + apicpath + e)
        }
    }
    exec(apicpath + e, {}, function(loginString, r, n) {
        return e && r && (console.error("\n\n"), console.error(r.replace(f.b64decode(config.password), "***"))), cb(loginString, r, n)
    })

}
// downloadYamlForProduct(e, function() {
//
//     var i = [];
//     Object.keys(e.catalog).forEachThen(function(o, s) {
//
//         var t = {},
//             c = {},
//             u = [];
//         i.push(function(e) {
//
//             r(c, s, e);
//         }), i.push(function(o) {
//             var f = e.catalog[s]["displayName"],
//                 d = new Catalog(s, f);
//
//             a.catalogs.push(d), fs.readdir(path.join(e.applicationDirectory, ".cache", e.server, e.organization, s), function(r, i) {
//                 if (r) throw r;
//                 i.forEachThen(function(o, r) {
//                     var fullPath = path.join(e.applicationDirectory, ".cache", e.server, e.organization, s, r);
//                     (fs.lstatSync(fullPath).isFile() && (fullPath.toLowerCase().endsWith(".yml") || fullPath.toLowerCase().endsWith(".yaml"))) ? (parseYaml(path.join(e.applicationDirectory, ".cache", e.server, e.organization, s, r), f, function(e, o) {
//                         console.log('--e--')
//                         console.log(e)
//                         console.log('--o--')
//                         console.log(o);
//                         if (e) throw e;
//                         if (o)
//                             if (o.api) {
//                                 t[r] = o.api
//                             } else o.product && o.product.plans && u.push(o.product)
//                     }), o()) : o()
//                 }, function() {
//                     console.log('--done--')
//
//                     n(c, t, u, d, function() {
//                         console.log(d);
//                         o()
//                     })
//
//                 })
//             })
//         })
//     }), async.series(i, function(e) {
//         if (e) throw console.error(e), e;
//         console.error("Processing Complete for " + s), o()
//     })
// }, function(r) {
//     console.log(a);
//     o(a);
//     console.log(a);
//     r;
//     // fs.removeSync(e.tempfolder);
// })

function downloadYamlForProduct(o, cb) {

    var a = [];
    Object.keys(o.catalog).forEachThen(function(cb, catalog) {

            var r = path.join(o.applicationDirectory, ".cache",o.server, o.organization, catalog);

            if (catalog == "drafts") {
                a.push(function(a) {
                  f.cd(r);
                    console.error("Begin downloadYamlForProduct function for " + catalog);
                    var i = " drafts --type=product -s " + o.server + " --organization " + o.organization,
                        t = " drafts:pull prodname --type=product -s " + o.server + "  --organization " + o.organization;
                    call(i, o, function(e, i) {
                        var c = i.toString().split("\n"),
                            s = [];
                        c.splice(c.indexOf(""), 1), c.forEach(function(r) {
                            s.push(function(a) {
                                var e, i = r.split(" ")[0];
                                "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + catalog + ":" + i + " this may take a few minutes..."), e.start()), call(t.replace("prodname", i), o, function(n) {
                                    n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
                                }))
                            })
                        }), async.parallel(s, function(o) {
                            if (o) throw o;
                            a();
                        })
                    })
                })
                cb();
            } else {
                a.push(function(a) {
                  f.cd(r);
                    console.error("Begin downloadYamlForProduct function for " + catalog);
                    var i = " products -s " + o.server + " -c " + catalog + " --organization " + o.organization,
                        t = " products:pull prodname -s " + o.server + " -c " + catalog + "  --organization " + o.organization;
                    call(i, o, function(e, i) {
                        e ? (console.error(e), process.exit()) : i || console.error('No products were found in the organization "' + o.organization + '" and catalog "' + catalog + '".');
                        var c = i.toString().split("\n"),
                            s = [];
                        c.splice(c.indexOf(""), 1), c.forEach(function(r) {
                            s.push(function(a) {
                                var e, i = r.split(" in ")[0];
                                "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + catalog + ":" + i + " this may take a few minutes..."), e.start()), call(t.replace("prodname", i), o, function(n) {
                                    n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
                                }))
                            })
                        }), async.parallel(s, function(o) {
                            if (o) throw o;
                            a();
                        })
                    })
                })
                cb();
            }
        },
        function() {
            async.series(a, function(o) {

                if (o) throw o;
                cb()

            })
        });
}

function call(e, config, callback) {

    var apicpath = path.join(config.applicationDirectory, 'node_modules', '.bin', 'apic ');
    console.error("Begin call function with command: " + apicpath + e), exec(apicpath + e, {}, function(e, r, n) {
        return e && r && (console.error("\n\n"), console.error(r.replace(f.b64decode(config.password), "***"))), callback(e, r, n);
    })
}

function getSubscriptions(catalog, config, callback) {
    var returnList = [];
    call(" subscriptions -c " + catalog + " --server " + config.server + " --organization " + config.organization,config, function(err, record, i) {
        if (err) throw console.error(err), err;
        if (i) throw console.error(i), i;
        record.toString().split("\n").forEachThen(function(e, r) {
            var entry = {}
            if ("" !== r) {
                entry.appName = r.split(" ")[2]
                var prod_v_plan = r.split(" ")[4].toString()
                entry.prod = prod_v_plan.split(":")[0]
                entry.prodv = prod_v_plan.split(":")[1]
                entry.plan = prod_v_plan.split(":")[2]
            }
            returnList.push(entry);
        }, function() {
            callback(returnList);
        })
    })
}

function getCatalog(r,config,cb) {
  call(" catalogs:get " + r + " --server " + config.server + " --organization " + config.organization,config, function(a, i, t) {
      if (a) throw o.fail(), console.error(a), a;
      if (t) throw o.fail(), console.error(t), t;

      var c = yaml.safeLoad(i);
      cb(c["display name"]);
    });
}
function getCatalogs(config,cb) {
  call(" catalogs --server " + config.server + " --organization " + config.organization,config, function(a, i, t) {
      if (a) throw a;
      if (t) throw t;
      cb(i.trim().split("\n"));
    });
}
function getOrganization(config,cb){

  call( " organizations --server " + config.server,config, function(o, a, i) {
      if (o) throw o;
      if (i) throw i;
      cb(a.trim().split("\n"));
  })
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
