"use strict";

var policy = false;

function process(config, o, a, e, i, t, n, r, c, d) {

    var u, v, s, l = "Product - ".bold + t.title + " : " + t.version,
        p = "Plan - ".bold + i.title,
        h = "API - ".bold + e.title + " : " + e.version,
        f = {};
    void 0 !== d && (u = "Application - ".bold + d);
    if ("mq" === a.type) {
        v = "Invoke QueueManager - ".bold + a.qm
        s = "Invoke Queue - ".bold + a.q;
    } else if (config.policy && "policy" === a.type) {
        v = "Policy Name ".bold + a.name
        s = "Policy Version - ".bold + a.version;
    } else if ("http" === a.type && !a.url.pathname.startsWith("/$(target-url)$(request.path)")) {
        v = "Invoke Host - ".bold + a.url.protocol + "//" + a.url.host;
        s = "Invoke ContextRoute - ".bold + a.url.pathname;
    } else if ("http" === a.type) {
        v = "Invoke Host -".bold + " $(target-url)";
        s = "Invoke ContextRoute -".bold + " $(request.path)"
    }

    n.forEachThen(function(o, a, e) {
        f["a" + e] = "Policy / Service Details 1" === a ? v : "Policy / Service Details 2" === a ? s : "API" === a ? h : "Product" === a ? l : "Plan" === a ? p : "Application" === a ? u : "Did not recognise : ".bold + a, o()
    }, function() {
        void 0 !== f.a0 && void 0 === r[c][f.a0] && (r[c][f.a0] = {}), void 0 !== f.a0 && void 0 !== f.a1 && void 0 === r[c][f.a0][f.a1] && (r[c][f.a0][f.a1] = {}), void 0 !== f.a0 && void 0 !== f.a1 && void 0 !== f.a2 && void 0 === r[c][f.a0][f.a1][f.a2] && (r[c][f.a0][f.a1][f.a2] = {}), void 0 !== f.a0 && void 0 !== f.a1 && void 0 !== f.a2 && void 0 !== f.a3 && void 0 === r[c][f.a0][f.a1][f.a2][f.a3] && (r[c][f.a0][f.a1][f.a2][f.a3] = {}), void 0 !== f.a0 && void 0 !== f.a1 && void 0 !== f.a2 && void 0 !== f.a3 && void 0 !== f.a4 && void 0 === r[c][f.a0][f.a1][f.a2][f.a3][f.a4] && (r[c][f.a0][f.a1][f.a2][f.a3][f.a4] = {}), void 0 !== f.a0 && void 0 !== f.a1 && void 0 !== f.a2 && void 0 !== f.a3 && void 0 !== f.a4 && void 0 !== f.a5 && void 0 === r[c][f.a0][f.a1][f.a2][f.a3][f.a4][f.a5] && (r[c][f.a0][f.a1][f.a2][f.a3][f.a4][f.a5] = {}), o(r)
    })
}

function processDir(o, config, e) {
  
    var i = {};
    o.catalogs.forEachThen(function(o, e) {
            var t = e.displayName;
            i[t] = 0 === e.products.length ? "No Products found" : {}, e.products.forEachThen(function(o, e) {
                e.plans.forEachThen(function(o, n) {
                    n.apis.forEachThen(function(o, r) {
                        if (r) {

                            r.invokes != [] ? r.invokes.forEachThen(function(o, c) {

                                n.apps && 0 === n.apps.length ? process(config, function(resp) {
                                    i = resp, o()
                                }, c, r, n, e, config.displaySchema, i, t) : n.apps.forEachThen(function(o, d) {
                                    process(config, function(a) {
                                        i = a, o()
                                    }, c, r, n, e, config.displaySchema, i, t, d.name)
                                }, o)
                            }, o, config) : (0 === n.apps.length ? process(config, function(a) {
                                i = a, o()
                            }, void 0, r, n, e, config.displaySchema, i, t) : n.apps.forEachThen(function(o, c) {

                                process(config, function(a) {
                                    i = a, o()
                                }, void 0, r, n, e, config.displaySchema, i, t, c.name)
                            }, o), o())
                        } else {
                          o();
                        }
                    }, o)
                }, o)
            }, o)
        },
        function(o) {
            if (o) throw o;
            e(i)
        })
}
require("foreachthen"), require("colors"), module.exports = processDir;
