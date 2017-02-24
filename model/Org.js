/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
var Draft = require('./Draft.js');

function Org(name) {
	this.name = name;
	this.catalogs = [];
	this.draft = new Draft(this);
}
module.exports = Org
