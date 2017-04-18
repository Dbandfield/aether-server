/* This script bundles the client side scripts using browserify and babel
    it is only run in development */

    var fs = require("fs");
    var browserify = require("browserify");
    var babelify = require("babelify");

    browserify({ debug: true })
      .transform(babelify)
      .require("./app/aether-web-app/scripts/main.js", { entry: true })
      .bundle()
      .on("error", function (err) { console.log("Error: " + err.message); })
      .pipe(fs.createWriteStream("./app/aether-web-app/scripts/bundle.js"));
