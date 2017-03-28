// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
function API(name, version, title) {
	this.invokes = [];
	this.version = version;
	this.name = name;
	this.title = title;
}
module.exports = API;
