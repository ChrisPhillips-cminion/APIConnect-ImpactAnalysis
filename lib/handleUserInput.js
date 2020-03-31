"use strict";

function handleUserInput(e, cb) {

    function version(r) {
        inquirer.prompt()
    }

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

    function a(e, r) {


        var n = f.makeSpinner("Fetching organizations");

        n.start();

        require('./' + e.version + '/interface.js').getOrganization(e, function(list) {
            n.succeed(), u.choices = list, inquirer.prompt(u).then(function(n) {
                return e = extend(e, n), r(e)
            })
        })
    }



    function i(e, r) {
        var n = f.makeSpinner("Fetching catalogs for organization: " + e.organization);
        n.start()
        require('./' + e.version + '/interface.js').getCatalogs(e, function(list) {
            n.succeed();
            var c,
                u = ["drafts"];
            list.forEach(function(e) {
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
                            o.start()
                            require('./' + e.version + '/interface.js').getCatalog(r, e, function(dn) {
                                o.succeed(), n();
                                void 0 === e.catalog && (e.catalog = {}), e.catalog[dn] = {
                                    displayName: dn,
                                    machineName: r,
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

    function t(config, r) {
        // var spin = f.makeSpinner("Logging in...");
        config.debug ? console.error("Begin apicLogin function") : require("./" + config.version + "/interface.js").apicLogin(config.username, f.b64decode(config.password), config.server, config, function(e) {
            if (e.match(/^Logged into/)) {
                // spin.succeed();
                void 0 === config.organization ? a(config, function(o) {
                    e = o, i(e, function(o) {
                        e = o, n(function() {
                            return r()
                        })
                    })
                }) : void 0 === config.catalog ? i(config, function(o) {
                    e = o, n(function() {
                        return r()
                    })
                }) : r()
            } else {
                // spin.fail()
                console.error(new Error("Failed to log into APIC, please see previous error message for details \n" + e));
            }
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
        }),
        void 0 === e.version && s.push({
            type: "list",
            name: "version",
            message: "Please select the target organization:",
            choices: ["v5", "v2018"],
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

            if (r.version == "v2018") {
                inquirer.prompt({
                    type: "input",
                    name: "realm",
                    message: "Realm",
                    default: "provider/default-idp-2",
                    validate: function(e) {
                        return "" === e ? (console.error("Invalid value provided"), !1) : !0
                    }
                }).then(function(realm) {

                    e.realm = realm.realm
                    console.log(':::::::::::::::::::::::::::  1')
                    e = extend(e, r), t(e, cb)
                });
            } else {
              console.log(':::::::::::::::::::::::::::  2')
                e = extend(e, r), t(e, cb  )
            }

        }) : void 0 !== e.catalog && void 0 !== e.organization ? getDataType(e, function() {
console.log(':::::::::::::::::::::::::::  3')
            o(e, function() {
console.log(':::::::::::::::::::::::::::  3.1')
                t(e, function() {
                    return cb()
                })
            })
        }) : t(e, function() {
            return cb()
        })
}
var f = require("./functions.js"),
    inquirer = require("inquirer"),
    extend = require("util")._extend,
    fs = require("fs.extra"),
    async = require("async"),
    path = require("path"),
    loginRun = false;

inquirer.registerPrompt("orderedcheckbox", require("inquirer-orderedcheckbox")), module.exports = handleUserInput;
