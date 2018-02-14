"use strict";

function downloadYamlForProduct(o, n) {
    var r = path.join(process.cwd(), o.tempfolder),
        a = [];
    f.cd(r), Object.keys(o.catalog).forEach(function(n) {
        if (n == "drafts") {
          a.push(function(a) {
              f.cd(path.join(r, n));
              var e = path.join(r, "..", "node_modules", ".bin", "apic");
              console.error("Begin downloadYamlForProduct function for " + n);
              var i = e + " drafts --type=product -s " + o.server  + " --organization " + o.organization,
                  t = e + " drafts:pull prodname --type=product -s " + o.server + "  --organization " + o.organization;
              f.call(i, function(e, i) {
                  // e ? (console.error(e)) : i
                  // console.error('No products were found in the organization ("' + o.organization + '") and catalog ("' + n + '").');
                  var c = i.toString().split("\n"),
                      s = [];
                  c.splice(c.indexOf(""), 1), c.forEach(function(r) {
                      s.push(function(a) {
                          var e, i = r.split(" ")[0];
                          "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + n + ":" + i + " this may take a few minutes..."), e.start()), f.call(t.replace("prodname", i), function(n) {
                              n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
                          }))
                      })
                  }), async.parallel(s, function(o) {
                      if (o) throw o;
                      f.cd(path.join(r, "..")), a()
                  })
              })
          })
        } else {
            a.push(function(a) {
                f.cd(path.join(r, n));
                var e = path.join(r, "..", "node_modules", ".bin", "apic");
                console.error("Begin downloadYamlForProduct function for " + n);
                var i = e + " products -s " + o.server + " -c " + n + " --organization " + o.organization,
                    t = e + " products:pull prodname -s " + o.server + " -c " + n + "  --organization " + o.organization;
                f.call(i, function(e, i) {
                    e ? (console.error(e), process.exit()) : i || console.error('No products were found in the organization "' + o.organization + '" and catalog "' + n + '".');
                    var c = i.toString().split("\n"),
                        s = [];
                    c.splice(c.indexOf(""), 1), c.forEach(function(r) {
                        s.push(function(a) {
                            var e, i = r.split(" in ")[0];
                            "" !== i && (o.debug || (e = f.makeSpinner("Downloading Product " + n + ":" + i + " this may take a few minutes..."), e.start()), f.call(t.replace("prodname", i), function(n) {
                                n ? (console.error(n), o.debug || e.fail()) : (o.debug || e.succeed(), a())
                            }))
                        })
                    }), async.parallel(s, function(o) {
                        if (o) throw o;
                        f.cd(path.join(r, "..")), a()
                    })
                })
            })
        }
    }), async.series(a, function(o) {
        if (o) throw o;
        n()
    })
}
var f = require("./functions.js"),
    async = require("async"),
    path = require("path");
module.exports = downloadYamlForProduct;
