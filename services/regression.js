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
  res.render("regression_temp.handlebars");
});

router.post("/", function(request, res) {
  var data = {
    attribute: request.body.attribute,
    x: request.body.x
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
  form_query = `Select *
                from
                (select
                        x, y, us_state
                                from
                                    (select count(incident_id) as y, us_state from
                                    gun_incidents where incident_year = 2016 
                                    group by us_state) t1,
                                    
                                    (select AVG(rate) as x, state from
                                    UNEMPLOYMENT_RATE where year = 2016
                                    group by state) t2
                                    
                                where t1.us_state = t2.state
                            ) 
                    union

                (select
                    slope,
                    ybar - xbar * slope as intercept,
                    'coefficient' as coef
                from
                    (
                        select
                            sum((x - xbar) * (y - ybar)) / sum((x - xbar) * (x - xbar)) as slope,
                            avg(ybar) as ybar,
                            avg(xbar) as xbar
                        
                        from
                            (
                                select
                                    avg(y) as ybar,
                                    avg(x) as xbar,
                                    us_state
                                from
                                    (select count(incident_id) as y, us_state from
                                    gun_incidents where incident_year = 2016 
                                    group by us_state) t1,
                                    
                                    (select AVG(rate) as x, state from
                                    UNEMPLOYMENT_RATE where year = 2016
                                    group by state) t2
                                    
                                    where t1.us_state = t2.state
                                    group by us_state
                            ) avgt,
                            (
                                select
                                    x, y
                                from
                                    (select count(incident_id) as y, us_state from
                                    gun_incidents where incident_year = 2016 
                                    group by us_state) t1,
                                    
                                    (select AVG(rate) as x, state from
                                    UNEMPLOYMENT_RATE where year = 2016
                                    group by state) t2
                                    
                                where t1.us_state = t2.state
                            ) datat
                        
                    ) r)`;

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
              res.render("regression_temp.handlebars", {
                NOCRIME: "No crimes committed"
              });
            } else {
              slope_intercept = result.rows.pop();

              //   console.log(result.rows);
              //   console.log(result.rows.length, slope_intercept);

              res.render("regression_temp.handlebars", {
                data: result.rows,
                slope_intercept: slope_intercept
              });
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
