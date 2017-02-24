/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
function Product(name, version,title) {
	this.name = name;
	this.version = version;
	this.title = title;
	this.plans = [];
}
module.exports = Product;
