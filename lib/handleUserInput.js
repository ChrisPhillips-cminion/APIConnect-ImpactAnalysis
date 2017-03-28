// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var f = require('./functions.js'),
    inquirer = require('inquirer'),
    extend = require('util')._extend,
    fs = require('fs.extra'),
    homeDir = process.cwd(),
    yaml = require('js-yaml'),
    async = require('async');


inquirer.registerPrompt('orderedcheckbox', require('inquirer-orderedcheckbox'));


function handleUserInput(config, callback) {
    var d = config.savePath,
        questions = [];
    if (d === undefined) {
        d = '.apicia';
    }
    var questionOrganization = {},
        questionSave = {
            type: 'confirm',
            name: 'save',
            message: 'Do you want to save this config:'
        },
        questionSaveLocation = {
            type: 'input',
            name: 'path',
            message: 'Where do you want the config file to be saved',
            default: d
        };
    if (config.organization === undefined) {
        questionOrganization = {
            type: 'list',
            name: 'organization',
            message: 'Please select the target organization:',
            validate: function (val) {
                if (val === '') {
                    console.error('Invalid value provided');
                    return false;
                }
                return true;
            }
        };
    }


    function savePrompt(cb) {
        inquirer.prompt(questionSave).then(function (save) {

            if (save.save) {
                inquirer.prompt(questionSaveLocation).then(function (resp) {
                    var json = JSON.stringify(config, {}, 2);
                    try {
                        fs.writeFileSync(resp.path, json);
                        console.error('Config saved to ' + resp.path);
                        cb();
                    } catch (err) {
                        console.error(err);
                    }
                });
            } else {
                cb();
            }

        });

    }

    function getDisplaySchema(config, callback) {

        if (config.displaySchema === undefined) {
            var displaySchema = [],
                questionDisplaySchema = {};
            displaySchema.push('Service - Host / QueueManager');
            displaySchema.push('Service - ContextRoute / Queue');
            displaySchema.push('API');
            displaySchema.push('Product');
            displaySchema.push('Plan');
            displaySchema.push('Application');

            questionDisplaySchema = {
                type: 'orderedcheckbox',
                name: 'displaySchema',
                choices: displaySchema,
                message: 'Please select which data you wish to show:',
                validate: function (val) {
                    if (val === []) {
                        console.error('Invalid value provided');
                        return false;
                    }
                    return true;
                }
            };

            inquirer.prompt(questionDisplaySchema).then(function (displaySchema) {
                config = extend(config, displaySchema);
                return callback(config);
            });
        } else {
            return callback(config);
        }

    }

    function getOrgs(config, callback) {
        var orgSpinner = f.makeSpinner('Fetching organizations');
        orgSpinner.start();
        f.call('node_modules/.bin/apic organizations --server ' + config.server, function (err, stdout, stderr) {
            if (err) {
                console.error(err);
                orgSpinner.fail();
                throw err;
            }
            if (stderr) {
                orgSpinner.fail();
                console.error(stderr);
                throw stderr;
            }

            var orgs = stdout.trim().split('\n');
            orgSpinner.succeed();
            questionOrganization.choices = orgs;
            inquirer.prompt(questionOrganization).then(function (org) {
                //get org DisplayName
                config = extend(config, org);
                return callback(config);
            });

        });
    }

    function getCats(config, callback) {
        var catSpinner = f.makeSpinner('Fetching catalogs for organization: ' + config.organization);
        catSpinner.start();
        f.call('node_modules/.bin/apic catalogs --server ' + config.server + ' --organization ' + config.organization, function (err, stdout, stderr) {
            if (err) {
                catSpinner.fail();
                console.error(err);
                throw err;
            }
            if (stderr) {
                catSpinner.fail();
                console.error(stderr);
                throw stderr;
            }
            catSpinner.succeed();
            var catalogs = stdout.trim().split('\n'),
                finalCats = [],
                questionCat;
            catalogs.forEach(function (e) {
                var splitCat = e.split('/');
                finalCats.push(splitCat[splitCat.length - 1]);
            });
            questionCat = {
                type: 'checkbox',
                name: 'catalog',
                choices: finalCats,
                message: 'Please select the target catalog:',
                validate: function (val) {
                    if (val === '') {
                        console.error('Invalid value provided');
                        return false;
                    }
                    return true;
                }
            };
            inquirer.prompt(questionCat).then(function (cats) {
                var calls = [];
                cats.catalog.forEach(function (cat) {
                    calls.push(function (callbackCat) {
                        var catName = f.makeSpinner('Get DisplayName for Catalog : ' + cat);
                        catName.start();
                        f.call('node_modules/.bin/apic catalogs:get ' + cat + ' --server ' + config.server + ' --organization ' + config.organization, function (err, stdout, stderr) {
                            if (err) {
                                catName.fail();
                                console.error(err);
                                throw err;
                            }
                            if (stderr) {
                                catName.fail();
                                console.error(stderr);
                                throw stderr;
                            }


                            catName.succeed();

                            callbackCat();
                            var jsonFile = yaml.safeLoad(stdout);

                            if (config.catalog === undefined) {
                                config.catalog = {};
                            }

                            config.catalog[cat] = {
                                'displayName': jsonFile['display name'],
                                'machineName': cat
                            };


                        });
                    });
                });

                async.series(calls, function (err) {
                    if (err) {
                        throw err;
                    }
                    getDisplaySchema(config, function () {
                        return callback();
                    });
                });
            });
        });
    }

    function getOrgCat(config) {
        f.apicLogin(config, function () {
            if (config.organization === undefined) {
                getOrgs(config, function (newConfig) {
                    config = newConfig;
                    getCats(config, function (newConfig) {
                        config = newConfig;
                        savePrompt(function () {
                            return callback();
                        });
                    });
                });
            } else if (config.catalog === undefined) {
                getCats(config, function (newConfig) {
                    config = newConfig;
                    savePrompt(function () {
                        return callback();
                    });
                });
            } else {
                savePrompt(function () {
                    return callback();
                });
            }
        });
    }



    if (config.server === undefined) {
        questions.push({
            type: 'input',
            name: 'server',
            message: 'API Connect Management Server?',
            validate: function (val) {
                if (val === '') {
                    console.error('Invalid value provided');
                    return false;
                }
                return true;
            }
        });
    }
    if (config.username === undefined) {

        questions.push({
            type: 'input',
            name: 'username',
            message: 'Username',
            validate: function (val) {
                if (val === '') {
                    console.error('Invalid value provided');
                    return false;
                }
                return true;
            }
        });
    }
    if (config.password === undefined) {
        questions.push({
            type: 'password',
            name: 'password',
            message: 'Password',
            validate: function (val) {
                if (val === '') {
                    console.error('Invalid value provided');
                    return false;
                }
                return true;
            },
            filter: function (val) {
                return f.b64encode(val);
            }
        });
    }
    if (questions.length > 0) {
        inquirer.prompt(questions).then(function (answers) {
            config = extend(config, answers);

            getOrgCat(config);

        });
    } else if (config.catalog !== undefined && config.organization !== undefined) {
        getDisplaySchema(config, function () {
            f.apicLogin(config, function () {
                return callback();
            });
        });
    } else {

        getOrgCat(config);


    }
}
module.exports = handleUserInput;
