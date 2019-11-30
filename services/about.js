const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
var oracledb = require("oracledb");
const exphbs = require("express-handlebars");

router.use(bodyParser.urlencoded({ extended: true }));
const config = {
  user: "jthies",
  password: "dbaccess001",
  connectString:
    "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
};
router.get("/", async function(request, res, next) {
  // console.log("Hello world");
  var input = request.query.id;
  if (input == undefined) {
    // console.log("No parameters received");
    res.render("about_temp.handlebars");
  } else {
    // console.log(input);
    var query = `Select count(*) from ${input}`;

    try {
      connection = await oracledb.getConnection(config);
      // console.log(binds);
      const result = await connection.execute(query);
      // console.log(result);
      res.render("about_temp.handlebars", { [input]: result.rows });
    } catch (err) {
      console.log("Ouch!", err);
    } finally {
      if (connection) {
        // conn assignment worked, need to close
        await connection.close();
      }
    }
  }
});

module.exports = router;
