/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
var urlImport = require('url');


function InvokeURL(url) {
	if (typeof url == "url") {
		this.url=url;
	}
	else if (typeof url == "string") {
		this.url = urlImport.parse(url);
	}
	else {
		throw error ("Url Must be a URL object or a string");
	}
	this.type = "http";
}
module.exports = InvokeURL;
