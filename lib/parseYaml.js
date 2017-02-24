/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
'use strict';
var fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('./config.js');

function parseYaml(file, callback) {

    var error = null,
        jsonFile = yaml.safeLoad(fs.readFileSync(file, 'utf8')),
        apiName = jsonFile.info['x-ibm-name'],
        apiTitle = jsonFile.info.title,
        version = jsonFile.info.version,
        results = {
            apis: {},
            products: {}
        },
        assembly,
        holder,
        url;

    // Check if it's a product and return early if so
    if (jsonFile.product) {
        results.products = {
            name: jsonFile.info.name,
            title: jsonFile.info.title,
            version: jsonFile.info.version,
            plans: jsonFile.plans,
            apis: jsonFile.apis
        };
        return callback(error, results);
    }
    if (jsonFile['x-ibm-configuration'].assembly) {
        assembly = jsonFile['x-ibm-configuration'].assembly.execute;
    } else {
        holder = {
            'apiname': apiName,
            'version': version,
            'title': apiTitle
        };
        results.apis = holder;
        return callback(error, results);
    }
    try {
        assembly.forEach(function (e) {


            if (e.mqinvoke !== undefined) {
                holder = {
                    'queuemanager': e.mqinvoke.queuemanager,
                    'apiname': apiName,
                    'version': version,
                    'title': apiTitle,
                    'requestqueue': e.mqinvoke.queue,
                    'replyqueue': e.mqinvoke.replyqueue,
                    'backoutqueue': e.mqinvoke.backoutq
                };
                results.apis = holder;
            } else if (e.invoke !== undefined) {
                // console.error(e.invoke);
                url = e.invoke['target-url'];
                if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
                    url = 'http://' + url;
                }
                holder = {
                    'service': url,
                    'apiname': apiName,
                    'version': version,
                    'title': apiTitle
                };
                results.apis = holder;
            } else if (e.proxy !== undefined) {
                url = e.proxy['target-url'];
                if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
                    url = 'http://' + url;
                }
                holder = {
                    'service': url,
                    'apiname': apiName,
                    'version': version,
                    'title': apiTitle
                };
                results.apis = holder;
            }

        });
    } catch (exception) {
        error = exception;
        console.error(exception);
        throw exception;
    } finally {
        if (config.debug) {
            console.error('ParseYAML.js returns: ' + JSON.stringify(results, {}, 2));
        }
        return callback(error, results);
    }
}
module.exports = parseYaml;
