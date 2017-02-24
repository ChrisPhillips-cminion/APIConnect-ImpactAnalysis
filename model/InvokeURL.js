/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
var urlImport = require('url');


function InvokeURL(url) {
	this.url = urlImport.parse(url);
	this.type = "http";
}
module.exports = InvokeURL;
