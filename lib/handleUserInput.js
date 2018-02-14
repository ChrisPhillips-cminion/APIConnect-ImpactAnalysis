"use strict";

function handleUserInput(e, r) {
    function n(r) {
        inquirer.prompt(l).then(function(n) {
            n.save ? inquirer.prompt(p).then(function(n) {
                var o = JSON.stringify(e, {}, 2);
                try {
                    fs.writeFileSync(n.path, o), console.error("Config saved to " + n.path), r()
                } catch (a) {
                    console.error(a)
                }
            }) : r()
        })
    }

    function o(e, r) {
        if (void 0 !== e.displaySchema) return r(e);
        var n = [],
            o = {};
        n.push("Policy / Service Details 1"), n.push("Policy / Service Details 2"), n.push("API"), n.push("Product"), n.push("Plan"), n.push("Application"), o = {
            type: "orderedcheckbox",
            name: "displaySchema",
            choices: n,
            message: "Please select which fields you wish to show:",
            validate: function(e) {
                return e === [] ? (console.error("Invalid value provided"), !1) : !0
            }
        }, inquirer.prompt(o).then(function(n) {
            return e = extend(e, n), r(e)
        })
    }

    function getDataType(config, callback) {

        if (config.dataType === undefined) {
            var dataType = [],
                questionDataType = {};
            dataType.push('Invokes and Proxies');
            dataType.push('Policies');
            dataType.push('Security');

            questionDataType = {
                type: 'list',
                name: 'dataType',
                choices: dataType,
                message: 'Please select which data you wish to query:',
                validate: function(val) {
                    if (val === []) {
                        console.error('Invalid value provided');
                        return false;
                    }
                    return true;
                }
            };

            inquirer.prompt(questionDataType).then(function(dataType) {
                config = extend(config, dataType);
                return callback(config);
            });
        } else {
            return callback(config);
        }

    }
    // function getDataType(config, callback) {
    //
    //     if (config.dataType === undefined) {
    //         var dataType = [],
    //             questionDataType = {};
    //         dataType.push('Invokes and Proxies');
    //         dataType.push('Policies');
    //         dataType.push('Security');
    //
    //         questionDataType = {
    //             type: 'list',
    //             name: 'dataType',
    //             choices: dataType,
    //             message: 'Please select which data you wish to query:',
    //             validate: function(val) {
    //                 if (val === []) {
    //                     console.error('Invalid value provided');
    //                     return false;
    //                 }
    //                 return true;
    //             }
    //         };
    //
    //         inquirer.prompt(questionDataType).then(function(dataType) {
    //             config = extend(config, dataType);
    //             return callback(config);
    //         });
    //     } else {
    //         return callback(config);
    //     }
    //
    // }
    function a(e, r) {
        var n = f.makeSpinner("Fetching organizations");
        n.start(), f.call(apicpath + " organizations --server " + e.server, function(o, a, i) {
            if (o) throw console.error(o), n.fail(), o;
            if (i) throw n.fail(), console.error(i), i;
            var t = a.trim().split("\n");
            n.succeed(), u.choices = t, inquirer.prompt(u).then(function(n) {
                return e = extend(e, n), r(e)
            })
        })
    }



    function i(e, r) {
        var n = f.makeSpinner("Fetching catalogs for organization: " + e.organization);
        n.start(), f.call(apicpath + " catalogs --server " + e.server + " --organization " + e.organization, function(a, i, t) {
            if (a) throw n.fail(), console.error(a), a;
            if (t) throw n.fail(), console.error(t), t;
            n.succeed();
            var c, s = i.trim().split("\n"),
                u = ["drafts"];
            s.forEach(function(e) {
                var r = e.split("/");
                u.push(r[r.length - 1])
            }), c = {
                type: "checkbox",
                name: "catalog",
                choices: u,
                message: "Please select the target catalog:",
                validate: function(e) {
                    return "" === e ? (console.error("Invalid value provided"), !1) : !0
                }
            }, inquirer.prompt(c).then(function(n) {
                var a = [];
                n.catalog.forEach(function(r) {
                    a.push(function(n) {
                        if (r == "drafts") {
                          void 0 === e.catalog && (e.catalog = {}), e.catalog[r] = {
                              displayName: "drafts",
                              machineName: "drafts"
                          },
                          n();
                        } else {
                            var o = f.makeSpinner("Get DisplayName for Catalog : " + r);
                            o.start(), f.call(apicpath + " catalogs:get " + r + " --server " + e.server + " --organization " + e.organization, function(a, i, t) {
                                if (a) throw o.fail(), console.error(a), a;
                                if (t) throw o.fail(), console.error(t), t;
                                o.succeed(), n();
                                var c = yaml.safeLoad(i);
                                void 0 === e.catalog && (e.catalog = {}), e.catalog[r] = {
                                    displayName: c["display name"],
                                    machineName: r
                                }
                            })
                        }
                    })
                }), async.series(a, function(n) {
                    if (n) throw n;
                    getDataType(e, function() {
                        o(e, function() {
                            return r()
                        })
                    })
                })
            })
        })
    }

    function t(e) {
        f.apicLogin(e, function() {
            void 0 === e.organization ? a(e, function(o) {
                e = o, i(e, function(o) {
                    e = o, n(function() {
                        return r()
                    })
                })
            }) : void 0 === e.catalog ? i(e, function(o) {
                e = o, n(function() {
                    return r()
                })
            }) : n(function() {
                return r()
            })
        })
    }
    var c = e.savePath,
        s = [];
    void 0 === c && (c = ".apicia");
    var u = {},
        l = {
            type: "confirm",
            name: "save",
            message: "Do you want to save this config:"
        },
        p = {
            type: "input",
            name: "path",
            message: "Where do you want the config file to be saved",
            "default": c
        };
    void 0 === e.organization && (u = {
        type: "list",
        name: "organization",
        message: "Please select the target organization:",
        validate: function(e) {
            return "" === e ? (console.error("Invalid value provided"), !1) : !0
        }
    }), void 0 === e.server && s.push({
        type: "input",
        name: "server",
        message: "API Connect Management Server?",
        validate: function(e) {
            return "" === e ? (console.error("Invalid value provided"), !1) : !0
        }
    }), void 0 === e.username && s.push({
        type: "input",
        name: "username",
        message: "Username",
        validate: function(e) {
            return "" === e ? (console.error("Invalid value provided"), !1) : !0
        }
    }), void 0 === e.password && s.push({
        type: "password",
        name: "password",
        message: "Password",
        validate: function(e) {
            return "" === e ? (console.error("Invalid value provided"), !1) : !0
        },
        filter: function(e) {
            return f.b64encode(e)
        }
    }), s.length > 0 ? inquirer.prompt(s).then(function(r) {
        e = extend(e, r), t(e)
    }) : void 0 !== e.catalog && void 0 !== e.organization ? getDataType(e, function() {
        o(e, function() {
            f.apicLogin(e, function() {
                return r()
            })
        })
    }) : t(e)
}
var f = require("./functions.js"),
    inquirer = require("inquirer"),
    extend = require("util")._extend,
    fs = require("fs.extra"),
    yaml = require("js-yaml"),
    async = require("async"),
    path = require("path"),
    apicpath = path.join(".", "node_modules", ".bin", "apic");
inquirer.registerPrompt("orderedcheckbox", require("inquirer-orderedcheckbox")), module.exports = handleUserInput;
