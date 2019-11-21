const express = require("express");
// const viewReports = require("./viewReport");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
// var fs = require("fs");
// var oracledb = require("oracledb");
const exphbs = require("express-handlebars");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + "/../public"));

// eval(fs.readFileSync("viewReport.js") + "");
// Register Handlebars view engine
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// Use Handlebars view engine
// app.set("view engine", "handlebars");

app.use("/", router);
// app.listen(process.env.port || 3000);
router.get("/", function(request, res, next) {
  // res.render("tempdisplay.handlebars");
  res.sendFile(path.join(__dirname + "/../views/index.html"));

  //__dirname : It will resolve to your project folder.
});

// router.get("/ViewReports", viewReports.report);
// router.post("/ViewReports", viewReports.reportPost);

console.log("Running home page at Port 3000");

module.exports = router;
