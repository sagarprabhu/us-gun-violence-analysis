var oracledb = require("oracledb");
var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
// app.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({ extended: true }));
var area;
var crime;
var array;
var one = [];

router.get("/", function(req, res) {
  res.render("../views/see.ejs", { one: "" });
});

router.post("/", async function(req, res) {
  settonull();
  handleaction(req, res);
  await new Promise(resolve => setTimeout(resolve, 2000));
  // console.log(one);
  res.render("../views/see.ejs", {
    area: array,
    crime: crime,
    one: one,
    first: one[0],
    second: one[1],
    third: one[2]
  });
});

function settonull() {
  one = [];
}
//handleOperation start
function handleOperation(request, response, callback) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  response.setHeader("Access-Control-Allow-Credentials", true);

  oracledb.getConnection(
    {
      user: process.env.DB_USER || "aj3",
      password: process.env.DB_PASSWORD || "Database1",
      connectString:
        "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    function(err, connection) {
      if (err) {
      }
      callback(request, response, connection);
    }
  );
} //handleOperation end

//handleaction start
function handleaction(req, res) {
  area = req.body.area;
  crime = req.body.crime;
  // console.log(area);
  // console.log(crime);
  /* if (typeof area === "string") {
    array = { key1: area };
    array = Object.values(array);
  } else array = Object.values(area);*/

  array = Object.values(area);
  // console.log("Areas are");
  // console.log(array);

  handleOperation(
    req,
    res,
    function(request, response, connection) {
      for (var k = 0; k < array.length; k++) {
        //    selectStatement= "select  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED) ), count(*) from incident where incident.dr_no IN  ( SELECT reports.dr_no FROM location,reports where location.coordinates=reports.coordinates  and reports.crime_code IN  ( SELECT crime_code FROM crime WHERE  description LIKE '%'||:c||'%' ) and location.area_id= (SELECT area_id from area where area_name=:a)  ) group by  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED)) ORDER BY EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED))" ;
        selectStatement =
          "select  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED)) as year, count(*) from incident where incident.dr_no IN  ( SELECT reports.dr_no FROM location,reports where location.coordinates=reports.coordinates  and reports.crime_code IN  ( SELECT crime_code FROM crime WHERE  description LIKE '%'||:c||'%' ) and location.area_id= (SELECT area_id from area where area_name=:a)  ) group by  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED)) ORDER BY EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED))";
        connection.execute(
          selectStatement,

          { c: crime, a: array[k] },
          function(err, result) {
            if (err) {
            } else {
              var ans = result.rows;
              var new_arr = [];
              // console.log(result.rows);
              var final_arr = new Array(10);
              final_arr.fill(0);
              // console.log("Final");
              // console.log(final_arr);
              for (var i = 0; i < ans.length; i++) {
                new_arr[i] = ans[i][0];
              }
              var z = 0;
              for (var i = 2010; i < 2020; i++) {
                if (new_arr.includes(i)) {
                  final_arr[i % 10] = ans[z++][1];
                }
              }

              // console.log("Updated array");
              // console.log(final_arr);
              // for()
              one.push(final_arr);

              //  console.log(one);
            }
          }
        ); //execute

        // console.log(one);
      } //FOR
    } //function
  );
}

function doRelease(connection) {
  connection.release(function(err) {
    if (err) {
      console.error(err.message);
    }
  });
}

module.exports = router;

// app.listen(3002, function () {
//     console.log('server started on port 3002');
// });
