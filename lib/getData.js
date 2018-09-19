"use strict";

function getData(e, o) {
    function r(o, r, n) {
        if (r != "drafts")
            require("./" + e.version + "/interface.js").getSubscriptions(r, e, function(array) {
                array.forEachThen(function(e, r) {

                    var appName = r.appName,
                        prod = r.prod,
                        prodv = r.prodv,
                        plan = r.plan,
                        app = new App(appName);
                    void 0 === o[prod] && (o[prod] = {}), void 0 === o[prod][prodv] && (o[prod][prodv] = {}), void 0 === o[prod][prodv][plan] && (o[prod][prodv][plan] = []), o[prod][prodv][plan].push(app)
                    console.log(o);

                    e()
                }, n)
            })

        else
            n();
    }

    function n(e, apis, r, n, cb) {

        r.forEachThen(function(cb, product) {
            for (var t in product.tempPlans) {

                var plan = new Plan(t, product.tempPlans[t].title);

                void 0 != e[product.name] && void 0 != e[product.name][product.version] && (plan.apps = e[product.name][product.version][plan.name]);
                var apiArray = Object.keys(product.apis);

                populatePlan(apiArray, plan, product, apis)
            }
            n.products.push(product), cb()
        }, cb)
    }

    function populatePlan(apiArray, plan, product, apis) {

        apiArray.forEachThen(function(cb, entry) {
            plan.apis.push(apis[product.apis[entry].$ref])

            cb()
        }, function() {
            product.plans.push(plan)
        })
    }
    var a = new Org(e.organization);

                require("./" + e.version + "/interface.js").downloadYamlForProduct(e, function(toReturn) {
                  o(toReturn);
                });


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
                parseYaml = require("./parseYaml.js"),
                async = require("async"); require("foreachthen");
            var f = require("./functions.js"),

                yaml = require("js-yaml"),
                fs = require("fs.extra"); module.exports = getData;
