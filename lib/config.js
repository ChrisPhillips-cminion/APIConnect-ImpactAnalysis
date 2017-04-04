// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var yaml = require('js-yaml');
var fs = require('fs');
var f = require('./functions.js');
var path = require('path');
// Set up the config object.
var requiredConfig = ['username', 'password', 'catalog', 'organization', 'server'];
var validFlags = ['--help', '-h', '--load', '--json'];
var homeDir = process.cwd();
var config = {
    'detailed': false,
    'tempfolder': 'tmp',
    'output': 'console',
    'catalog': {}
};

function flagValue(flag1, flag2) {
    if ((process.argv.indexOf(flag1) !== -1) || (process.argv.indexOf(flag2) !== -1)) {
        if (process.argv.indexOf(flag1) !== -1) {
            if (process.argv[process.argv.indexOf(flag1) + 1]) {
                if (process.argv[process.argv.indexOf(flag1) + 1].match(/^\-/) || (!process.argv[process.argv.indexOf(flag1) + 1])) {
                    console.error('The flag: "' + flag1 + '" requires a value.');
                    process.exit();
                } else {
                    return process.argv[process.argv.indexOf(flag1) + 1];
                }
            } else {
                console.error('The flag: "' + flag1 + '" requires a value.');
                process.exit();
            }
        } else {
            if (process.argv[process.argv.indexOf(flag2) + 1]) {
                if (process.argv[process.argv.indexOf(flag2) + 1].match(/^\-/) || (!process.argv[process.argv.indexOf(flag2) + 1])) {
                    console.error('The flag: "' + flag2 + '" requires a value.');
                    process.exit();
                } else {
                    return process.argv[process.argv.indexOf(flag1) + 1];
                }
            } else {
                console.error('The flag: "' + flag2 + '" requires a value.');
                process.exit();
            }
        }
    }
}

function isFlag(flag) {
    if (process.argv.indexOf(flag) !== -1) {
        return true;
    }
    return false;
}

// This one has to stay first otherwise we wipe the current config object with file
if (isFlag('--load') || isFlag('-l')) {
    var loadPath = flagValue('--load', '-l');
    if (fs.existsSync(loadPath)) {
        config = JSON.parse(fs.readFileSync(loadPath));
        config.savePath = loadPath;
    } else {
        console.error('The file specified for load at: ' + loadPath + ' could not be found, please try again.');
        process.exit();
    }
} else {
    config.savePath = undefined;
}

if (isFlag('--help') || isFlag('-h')) {
    config.showHelp = true;
}

if (isFlag('--debug') || isFlag('-d')) {
    config.debug = true;
}

if (isFlag('--json')) {
    config.output = 'json';
}

if (isFlag('--save') || isFlag('-s')) {
    var savePath = flagValue('--save', '-s');
    config.savePath = path.join(homeDir , savePath);
}

// Catch anything else
process.argv.forEach(function (e, i) {
    if (i < 2) {
        return;
    }
    if (e.includes('-') && validFlags.indexOf(e) === -1) {
        console.error('The arguement: ' + e + ' was not recognised.');
        config.showHelp = true;
    }
});

module.exports = config;
