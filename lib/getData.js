"use strict";

function getData(e, o) {
    function r(o, r, n) {
        if (r != "drafts")
            f.call(apicpath + " subscriptions -c " + r + " --server " + e.server + " --organization " + e.organization, function(e, r, i) {
                if (e) throw console.error(e), e;
                if (i) throw console.error(i), i;
                r.toString().split("\n").forEachThen(function(e, r) {
                    if ("" !== r) {
                        var appName = r.split(" ")[2],
                            prod_v_plan = r.split(" ")[4].toString(),
                            prod = prod_v_plan.split(":")[0],
                            prodv = prod_v_plan.split(":")[1],
                            plan = prod_v_plan.split(":")[2],
                            app = new App(appName);
                        void 0 === o[prod] && (o[prod] = {}), void 0 === o[prod][prodv] && (o[prod][prodv] = {}), void 0 === o[prod][prodv][plan] && (o[prod][prodv][plan] = []), o[prod][prodv][plan].push(app)
                    }
                    e()
                }, n)
            })
        else
          n();
    }

    function n(e, o, r, n, a) {
        r.forEachThen(function(r, a) {
            for (var t in a.tempPlans) {
                var c = new Plan(t, a.tempPlans[t].title);
                void 0 != e[a.name] && void 0 != e[a.name][a.version] && (c.apps = e[a.name][a.version][c.name]);
                var u = Object.keys(a.apis);
                i(u, c, a, o, a)
            }
            n.products.push(a), r()
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
                // f.call(apicpath + " catalogs:get " + s + " --server " + e.server + " --organization " + e.organization, function(r, i, p) {
                    // if (r && s!='drafts')  {
                    //   throw console.error(r), r;
                    // }
                    // if (p) throw console.error(p), p;
                    // var l = yaml.safeLoad(i),
                      var  f = e.catalog[s]["displayName"],
                        d = new Catalog(s, f);

                    a.catalogs.push(d), fs.readdir(path.join(e.tempfolder, s), function(r, i) {
                        if (r) throw r;
                        i.forEachThen(function(o, r) {
                            var fullPath = path.join(e.tempfolder, s, r);
                            (fs.lstatSync(fullPath).isFile() && (fullPath.toLowerCase().endsWith(".yml") || fullPath.toLowerCase().endsWith(".yaml"))) ? (parseYaml(path.join(e.tempfolder, s, r), f, function(e, o) {
                                if (e) throw e;
                                if (o)
                                    if (o.api) {
                                        t[r] = o.api
                                    } else o.product && o.product.plans && u.push(o.product)
                            }), o()) : o()
                        }, function() {
                            n(c, t, u, d, function() {
                                o()
                            })
                        })
                    })
                // })
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
