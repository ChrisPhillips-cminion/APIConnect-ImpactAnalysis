// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
var urlImport = require('url');


function InvokeURL(url) {
	console.log(url);
	if (typeof url == "url") {
		this.url=url;
	}
	else if (typeof url == "string") {
		this.url = urlImport.parse(url);
	}
	else {
		throw new Error("Url Must be a URL object or a string not "+typeof url);
	}
	this.type = "http";
}
module.exports = InvokeURL;
