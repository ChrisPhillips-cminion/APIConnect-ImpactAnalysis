function InvokeURL(r) {
    if ("url" == typeof r) this.url = r;
    else {
        if ("string" != typeof r) throw new Error("Url Must be a URL object or a string not " + typeof r);
        this.url = urlImport.parse(r)
    }
    this.type = "http"
}
var urlImport = require("url");
module.exports = InvokeURL;
