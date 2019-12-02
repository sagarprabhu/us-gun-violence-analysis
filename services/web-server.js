const http = require("http");
const express = require("express");
const webServerConfig = require("../config/web-server.js");
// const database = require("./database.js");
const rankingPage = require("./router.js");
const home = require("./home.js");
const info = require("./info.js");
const about = require("./about.js");
const comparisonPage = require("./compareChart.js");
const viewReport = require("./viewReport.js");
const report = require("./report.js");
const ranking2 = require("./ranking2.js");
const trends = require("./trends_2.js");
const trends1 = require("./trends.js");
const exphbs = require("express-handlebars");
const regression = require("./regression.js");
// const router = express.Router();
let httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

    var hbs = exphbs.create({
      defaultLayout: "main",
      // Specify helpers which are only registered on this instance.
      helpers: {
        inc: function(value, options) {
          return parseInt(value) + 1;
        }
      }
    });
    //  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
    app.engine("handlebars", hbs.engine);
    app.set("view engine", "handlebars");
    app.use(express.static(__dirname + "/../public"));
    app.use("/", home);
    app.use("/ranking", rankingPage);
    app.use("/report", report);
    app.use("/comparison", comparisonPage);
    app.use("/viewReport", viewReport);
    app.use("/ranking2", ranking2);
    app.use("/trends", trends);
    app.use("/trends1", trends1);
    app.use("/info", info);
    app.use("/about", about);
    app.use("/regression", regression);

    httpServer
      .listen(webServerConfig.port)
      .on("listening", () => {
        console.log(
          `Web server listening on localhost:${webServerConfig.port}`
        );

        resolve();
      })
      .on("error", err => {
        reject(err);
      });
  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close(err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

/* router.get("/", function(request, res, next) {
  // res.render("tempdisplay.handlebars");
  res.sendFile(path.join(__dirname + "../index.html"));

  //__dirname : It will resolve to your project folder.
}); */

module.exports.close = close;
