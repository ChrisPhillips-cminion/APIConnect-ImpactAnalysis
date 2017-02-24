var arrowDiagram = require('json-hood');

var Org = require('./Org.js');
var Catalog= require('./Catalog.js');
var Product = require('./Product.js');
var Plan = require('./Plan.js');
var API= require('./API.js');
var InvokeURL = require('./InvokeURL.js');
var InvokeMQ = require('./InvokeMQ.js');

var org = new Org("config.organzation");
org.catalogs.push(new Catalog('catname','Catalog DisplayName',org));

var prod = new Product('Product1','1.0');
prod.plans.push(new Plan('Plan1'));
var api = new API("API1");
api.invoke.push(new InvokeURL("http://www.google.com/"));
prod.plans[0].apis.push(new API('API','1.0'));
prod.plans[0].apis[0].invoke.push(new InvokeURL("http://www.google.com/"));
org.catalogs[0].products.push(prod);
org.draft.products.push(prod);

console.log("Org:");
console.log(org)
console.log("Product:");
console.log(prod)
console.log("API:");
console.log(api)
