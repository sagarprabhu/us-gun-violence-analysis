const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
var oracledb = require("oracledb");
const exphbs = require("express-handlebars");

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", function(request, res, next) {
  // console.log("Hello world");
  res.render("ranking2temp.handlebars");
});

router.post("/", function(request, res) {
  var data = {
    year: request.body.year,
    attribute: request.body.attribute,
    rows: request.body.rows,
    order: request.body.order
  };
  var attribute_to_name = {
    n_killed: "People killed",
    n_injured: "People injured",
    n_guns_involved: "Total guns used"
  };
  console.log(data);

  // console.log(data.date);
  var form_query = "";
  var binds = [];
  if (data.year == "All Years") {
    form_query = `select sum(${data.attribute}), us_state from gun_incidents
                    group by us_state
                    order by sum(${data.attribute}) ${data.order}
                    FETCH FIRST ${data.rows} ROWS ONLY`;
  } else {
    form_query = `select sum(${data.attribute}), us_state from gun_incidents
                    where incident_year = ${data.year}
                    group by us_state
                    order by sum(${data.attribute}) ${data.order}
                    FETCH FIRST ${data.rows} ROWS ONLY`;
  }

  oracledb.getConnection(
    {
      user: "jthies",
      password: "dbaccess001",
      connectString:
        "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    function(err, connection) {
      if (err) {
        console.error(err);
        return;
      }
      connection.execute(
        form_query,
        binds,
        // [updated_date, data.starttime, data.endtime, data.area],
        function(err, result) {
          if (err) {
            console.error(err);
            return;
          } else {
            if (result.rows.length == 0) {
              res.render("ranking2temp.handlebars", {
                NOCRIME: "No crimes committed"
              });
            } else {
              console.log(result.rows);
              res.render("ranking2temp.handlebars", {
                data: result.rows,
                attribute: `${attribute_to_name[data.attribute]} (${data.year})`
              });
              // console.log(result.rows.length);
              // console.log(result.rows);
            }
          }
        }
      );
      // await connection.close();
    }
  );
});

// app.use("/", router);
// console.log("Running at Port 3000");
module.exports = router;
