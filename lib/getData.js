"use strict";

function getData(e, o) {
    function r(o, r, n) {
        f.call(apicpath + " subscriptions -c " + r + " --server " + e.server + " --organization " + e.organization, function(e, r, i) {
            if (e) throw console.error(e), e;
            if (i) throw console.error(i), i;
            r.toString().split("\n").forEachThen(function(e, r) {
                if ("" !== r) {
                    var n = r.split(" ")[2],
                        i = r.split(" ")[4].toString(),
                        a = i.split(":")[0],
                        s = i.split(":")[1],
                        t = i.split(":")[2],
                        c = new App(n);
                    void 0 === o[a] && (o[a] = {}), void 0 === o[a][s] && (o[a][s] = {}), void 0 === o[a][s][t] && (o[a][s][t] = []), o[a][s][t].push(c)
                }
                e()
            }, n)
        })
    }

    function n(e, o, r, n, a) {
        var s;
        r.forEachThen(function(r, a) {
            s = new Product(a.name, a.version, a.title);
            for (var t in a.plans) {
                var c = new Plan(t, a.plans[t].title);
                void 0 != e[a.name] && void 0 != e[a.name][a.version] && (c.apps = e[a.name][a.version][c.name]);
                var u = Object.keys(a.apis);
                i(u, c, s, o, a)
            }
            n.products.push(s), r()
        }, a)
    }

    function i(e, o, r, n, i) {
        e.forEachThen(function(e, r) {
            o.apis.push(n[i.apis[r].$ref]), e()
        }, function() {
            r.plans.push(o)
        })
    }
    var a = new Org(e.organization);
    downloadYamlForProduct(e, function() {
        var i = [];
        Object.keys(e.catalog).forEachThen(function(o, s) {
            var t = {},
                c = {},
                u = [];
            i.push(function(e) {
                r(c, s, e)
            }), i.push(function(o) {
                f.call(apicpath + " catalogs:get " + s + " --server " + e.server + " --organization " + e.organization, function(r, i, p) {
                    if (r) throw console.error(r), r;
                    if (p) throw console.error(p), p;
                    var l = yaml.safeLoad(i),
                        f = l["display name"],
                        d = new Catalog(s, f);
                    a.catalogs.push(d), fs.readdir(path.join(e.tempfolder, s), function(r, i) {
                        if (r) throw r;
                        i.forEachThen(function(o, r) {
                            fs.lstatSync(path.join(e.tempfolder, s, r)).isFile() ? (parseYaml(path.join(e.tempfolder, s, r), function(e, o) {
                                if (e) throw e;
                                var n;
                                if (void 0 != o)
                                    if (void 0 != o.apis && o.apis != {}) {
                                        var i = new API(o.apis.apiname, o.apis.version, o.apis.title);
                                        o.apis.service.forEach(function(e) {
                                            o.apis.service && (n = new InvokeURL(e), i.invokes.push(n))
                                        }), o.apis.qm.forEach(function(e) {
                                            n = new InvokeMQ(e.queuemanager, e.requestqueue), i.invokes.push(n)
                                        }), o.apis.policy.forEach(function(e) {

                                            n = new Policy(e.name, e.version), i.invokes.push(n)
                                        }), t[r] = i
                                    } else o.products && o.products.plans && u.push(o.products)
                            }), o()) : o()
                        }, function() {
                            n(c, t, u, d, function() {
                                o()
                            })
                        })
                    })
                })
            }), async.series(i, function(e) {
                if (e) throw console.error(e), e;
                console.error("Processing Complete for " + s), o()
            })
        }, function(r) {
            o(a), r || fs.removeSync(e.tempfolder)
        })
    })
}
var Org = require("../model/Org.js"),
    InvokeURL = require("../model/InvokeURL.js"),
    InvokeMQ = require("../model/InvokeMQ.js"),
    API = require("../model/API.js"),
    Product = require("../model/Product.js"),
    Plan = require("../model/Plan.js"),
    Policy = require("../model/Policy.js"),
    App = require("../model/App.js"),
    Catalog = require("../model/Catalog.js"),
    path = require("path"),
    downloadYamlForProduct = require("./downloadYamlForProduct.js"),
    parseYaml = require("./parseYaml.js"),
    async = require("async");
require("foreachthen");
var f = require("./functions.js"),
    apicpath = path.join(".", "node_modules", ".bin", "apic"),
    yaml = require("js-yaml"),
    fs = require("fs.extra");
module.exports = getData;
