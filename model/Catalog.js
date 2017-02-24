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
