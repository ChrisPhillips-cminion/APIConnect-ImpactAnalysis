function Org(t) {
  this.name = t,
  this.catalogs = [],
  this.draft = new Draft(this)
}
var Draft = require("./Draft.js");
module.exports = Org;
