/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var f = module.exports = {},
    exec = require('child_process').exec,
    fs = require('fs.extra'),
    config = require('./config.js'),
    terminal = require('window-size'),
    Ora = require('ora'),
    width = terminal.width / 2,
    divideLine = ('─').repeat(width),
    apicLogin = require('./apicLogin');

var offline = true;

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i].name === obj) {
            return true;
        }
    }
    return false;
};

f.printDivideLine = function () {
    console.error(divideLine + '\n');
};

f.call = function (command, callback) {
    //console.error(command)
    if (config.debug) {
        if (!command.includes('password')) {
            console.error('Begin f.call function with command: ' + command);
        } else {
            console.error('This f.call command has not been logged as it contains password information');
        }
    }
    exec(command, {}, function (err, stdout, stderr) {
        if (err) {
            throw err;
        }
        return callback(err, stdout, stderr);
    });

};

f.cd = function (dir) {

    if (f.isDir(dir)) {

        if (config.debug) {
            console.error('Changing directory to: ' + dir);
        }
        process.chdir(dir);

    } else {
        fs.mkdir(dir, function (e) {

            if (e) {
                console.error(e);
            }

            if (config.debug) {
                console.error('Changing directory to: ' + dir);
            }
            process.chdir(dir);
        });
    }

};


f.makeSpinner = function (text) {
    var downloadSpinner = new Ora({
        'text': text
    });
    return downloadSpinner;
};

f.isDir = function (path) {
    //console.error('Checking whether directory: ' + path + ' exists');
    var startDir = process.cwd(),
        exists = false;
    try {
        process.chdir(path);
        exists = true;
    } finally {
        process.chdir(startDir);
        return exists;
    }
};


f.apicLogin = function (config, callback) {
    var loginSpinner = f.makeSpinner('Logging in...');
    if (!config.debug) {
        loginSpinner.start();
    } else {
        console.error('Begin apicLogin function');
    }
    apicLogin(config.username, f.b64decode(config.password), config.server, function (stdout) {
        if (stdout.match(/^Logged into/)) {
            loginSpinner.succeed();
            return callback();
        }
        loginSpinner.fail();
        console.error(new Error('Failed to log into APIC, please see previous error message for details' ));
    });
};


f.b64encode = function (str) {
    return new Buffer(str).toString('base64');
};

f.b64decode = function (str) {
    return new Buffer(str, 'base64').toString('utf8');
};

f.showHelp = function () {
    console.log('node apicia.js [--json] [--load <path>] [--help] ');
    console.log('--load <path> \t\t-\t Load Config from path');
    console.log('--json \t\t\t-\t print the response in JSON');
    console.log('--help  \t\t-\t this message');
};
