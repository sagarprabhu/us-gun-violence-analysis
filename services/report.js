const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
var oracledb = require("oracledb");
const exphbs = require("express-handlebars");

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", function(request, res, next) {
  res.render("report_temp.handlebars");
});

router.post("/", function(request, res) {
  var data = {
    year: request.body.year,
    state: `'${request.body.state}'`
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
  form_query = `SELECT high_school_graduate, bachelors_degree, foreign_born, native_born_in_united_states, killedSum, injuredSum, candidate, party, maxCandidatevotes, totalvotes, t2.us_state, t2.year
  FROM DEMOGRAPHIC, ( 
                      SELECT sum(n_killed) killedSum, sum(n_injured) injuredSum, count(incident_id) incidentTotal, candidate, party, maxCandidatevotes, totalvotes, gun_incidents.us_state, t.year
                      FROM gun_incidents, (
                              SELECT h.maxCandidatevotes, h.us_state, h.year, candidate, party, totalvotes
                              FROM (
                                  SELECT max(candidatevotes) as maxCandidatevotes, us_state, unemployment_rate.year as year
                                  FROM unemployment_rate, president_vote
                                  WHERE unemployment_rate.state = ${data.state} and president_vote.us_state = ${data.state} and unemployment_rate.year = ${data.year}
                                  and 
                                  unemployment_rate.year BETWEEN president_vote.voting_year and president_vote.voting_year+3
                                  group by us_state, unemployment_rate.year
                                  ) h,
                                  president_vote pv
                              WHERE h.maxCandidatevotes = pv.candidatevotes and pv.us_state = ${data.state} and h.year BETWEEN pv.voting_year and pv.voting_year+3
                              ) t
                      WHERE gun_incidents.us_state = ${data.state} and  gun_incidents.incident_year = ${data.year}
                      group by candidate, party, maxCandidatevotes, totalvotes, gun_incidents.us_state, t.year
                      ) t2
  WHERE DEMOGRAPHIC.us_state = ${data.state} and DEMOGRAPHIC.demographic_year = ${data.year}
  `;
  avg_query = `
  SELECT d.*, gi.*, 'avg' as candidate, 'avg' as party, h2.*, 'entire us' as us_state, ${data.year} as year
    FROM (
        SELECT CAST(AVG(h.maxCandidatevotes) as int) as avgMaxCandidatevotes, cast(AVG(h.totalvotes) as int) as avgTotalVotes
        FROM (
            SELECT max(candidatevotes) as maxCandidatevotes, us_state, unemployment_rate.year as year, totalvotes
            FROM unemployment_rate, president_vote
            WHERE unemployment_rate.state = president_vote.us_state and unemployment_rate.year = ${data.year}
            and 
            unemployment_rate.year BETWEEN president_vote.voting_year and president_vote.voting_year+3
            group by us_state, unemployment_rate.year, totalvotes
            ) h
        ) h2,
        (
        SELECT cast(avg(n_killedTotal) as int) killedAVG, cast(avg(n_injuredTotal) as int) injuredAVG, cast(avg(incident_idTotal) as int) incidentAVG
        from (
            SELECT sum(n_killed) as n_killedTotal, sum(n_injured) as n_injuredTotal, count(incident_id) as incident_idTotal
            FROM gun_incidents
            WHERE gun_incidents.incident_year = ${data.year}
            GROUP BY us_state
            )
        ) gi,
        (
        SELECT cast(avg(high_school_graduate) as int) as avgHighSchoolGraduate, cast(avg(bachelors_degree) as int) as avgBachelorsDegree, cast(avg(foreign_born) as int) as avgForeignBorn, cast(avg(native_born_in_united_states) as int) as avgNativeBorn
        FROM DEMOGRAPHIC
        ) d`;

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
      ans = {};
      connection.execute(avg_query, binds, function(err, result) {
        if (err) {
          console.error(err);
          return;
        } else {
          if (result.rows.length == 0) {
            // res.render("report_temp.handlebars", {
            //   NOCRIME: "No crimes committed"
            // });
          } else {
            ans.query1 = result.rows;
            connection.execute(form_query, binds, function(err, result) {
              if (err) {
                console.error(err);
                return;
              } else {
                if (result.rows.length == 0) {
                  res.render("report_temp.handlebars", {
                    NOCRIME: "No crimes committed"
                  });
                } else {
                  ans.query2 = result.rows;
                  console.log(ans);

                  res.render("report_temp.handlebars", {
                    avg: ans.query1,
                    data: ans.query2,
                    heading: `${data.state} crime statistics ${data.year}`
                  });
                  // console.log(result.rows.length);
                  // console.log(result.rows);
                }
              }
            });
          }
        }
      });
      // await connection.close();
    }
  );
});

// app.use("/", router);
// console.log("Running at Port 3000");
module.exports = router;
