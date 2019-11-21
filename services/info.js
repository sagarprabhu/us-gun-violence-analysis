const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
var oracledb = require("oracledb");
const exphbs = require("express-handlebars");

router.use(bodyParser.urlencoded({ extended: true }));
const config = {
  user: "aj3",
  password: "Database1",
  connectString:
    "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
};
router.get("/", async function(request, res, next) {
  // console.log("Hello world");
  var track = request.query.id;
  if (track == undefined) {
    // console.log("No parameters received");
    res.render("info.handlebars");
  } else {
    // console.log(track);
    var query = `Select count(*) from ${track}`;

    try{
      connection = await oracledb.getConnection(config);
      // console.log(binds);
      const result = await connection.execute(query);
      // console.log(result);
      res.render("info.handlebars", { [track]: result.rows });
    } catch (err) {
      console.log('Ouch!', err);
    } finally {
      if (connection) { // conn assignment worked, need to close
        await connection.close();
      }
    }



    // oracledb.getConnection(
    //   ,
    //   function(err, connection) {
    //     if (err) {
    //       console.error(err);
    //       return;
    //     }
    //     connection.execute(
    //       query,
    //       // [updated_date, data.starttime, data.endtime, data.area],
    //       function(err, result) {
    //         if (err) {
    //           console.error(err);
    //           return;
    //         } else {
    //           res.render("info.handlebars", { [track]: result.rows });
    //         }
    //       }
    //     );
    //     // connection.close();
    //   }
    // );
  }

  // if (request.query.id == "Area") console.log("In Area");
});

/* router.get("/:id", function(request, res, next) {
  // console.log("Hello world");
  var track = request.params.id;
  var query = `Select count(*) from ${track}`;
  oracledb.getConnection(
    {
      user: "aj3",
      password: "Database1",
      connectString:
        "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    function(err, connection) {
      if (err) {
        console.error(err);
        return;
      }
      connection.execute(
        query,
        // [updated_date, data.starttime, data.endtime, data.area],
        function(err, result) {
          if (err) {
            console.error(err);
            return;
          } else {
            res.render("info.handlebars", { [track]: result.rows });
          }
        }
      );
    }
  );
}); */

module.exports = router;
