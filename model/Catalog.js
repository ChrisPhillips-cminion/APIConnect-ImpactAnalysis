// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
function Catalog(name, dp,org) {
	this.name = name;
	this.displayName = dp;
	this.products = [];
	this.org = org;
}


module.exports = Catalog
