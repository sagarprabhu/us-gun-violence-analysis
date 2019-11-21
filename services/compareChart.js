var express = require('express');
var oracledb = require('oracledb');
//const path = require("path");
var router = express.Router();
//var ejs = require('ejs');
const bodyParser = require("body-parser");
var chart = require("chart.js")

router.use(bodyParser.urlencoded({ extended: true }));
router.get("/", function(request, res, next) {
  res.render('../views/compareForm.ejs',{data: ""});
});

/* GET users listing. */
router.post("/", function(request, res) {

  var compareBasedOn = request.body.basedon;
  var resultCount = [];
  var finalData = [];
  var data = {
    year: request.body.year,
    area: request.body.area,
    age: request.body.age,
    timeframe: request.body.timeframe
  };

  oracledb.getConnection(
    {
      user          : "aj3",
      password      : "Database1",
      connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    function(err, connection)
    {
      if (err) { console.error(err); return; }
      

      if(data.year == ""){
        var yearstartdate = '01-Jan-2010'
        var yearenddate = '31-Dec-2019'
      }
      else{
        var yearstartdate = '01-Jan-' + request.body.year;
        var yearenddate = '31-Dec-' + request.body.year;
      }

      if(data.area == ''){
        var areaName = '%';
      }
      else{
        var areaName = data.area;
      }
      timeSlot = data.timeframe.split(' ');
      startTime = Number(timeSlot[0]);
      endTime = Number(timeSlot[2]);
      ageGroup = data.age.split('-');

      var timeSwitchCase = '';
      for(var i=0; i< 24; i=i+2){
        var j = i+2;
        timeSwitchCase += "when time_occurred between "+ i +"00 and "+ j +"00 then '"+i+":00 to "+j+":00' \n";     
      }

      const timeQuery = 
      `select case 
              `+timeSwitchCase+`
          end as time_occurred_range, count(*) as count from
        (select * from incident 
        where date_occurred between :1 and :2) inc 
        join reports 
        on inc.dr_no = reports.dr_no 
          where victim_id in (select victim_id from victim where age between :3 and :4) 
        and coordinates in 
        (select coordinates from location where area_id in 
        (select area_id from area where area_name like :5))
        group by case 
        `+timeSwitchCase+`
      end
      order by min(time_occurred)`;

      const locationQuery = 
      `select area_name, count(*) as count from 
        (select * from incident 
        where time_occurred between :1 and :2 
              and date_occurred between :3 and :4) inc 
        join reports 
             on inc.dr_no = reports.dr_no 
        join location 
             on reports.coordinates = location.coordinates 
        join area 
             on area.area_id = location.area_id
        where victim_id in (select victim_id from victim where age between :5 and :6) 
        group by area_name`;        

      const ageSwitchCase = 
         `case
             when age between 0 and 18 then 'Children 0-18' 
             when age between 19 and 25 then 'Youth 19-25'
             when age between 26 and 34 then 'Young Adults 26-34'
             when age between 35 and 54 then 'Middle-aged Adults 25-54'
             when age between 55 and 64 then 'Old Adults 55-64'
             else 'Senior Citizens 65+'
         end`


      const ageGroupQuery = 
      `select `+ ageSwitchCase +
      ` as age_group, count(*) as count from
        (select * from incident 
          where time_occurred between :1 and :2 
          and date_occurred between :3 and :4) inc 
      join reports 
        on inc.dr_no = reports.dr_no 
      join victim
        on reports.victim_id = victim.victim_id
        where coordinates in 
          (select coordinates from location where area_id in 
            (select area_id from area where area_name like :5))
      group by `+ ageSwitchCase +
      ` order by min(age)`;





      //by time frame
      if(compareBasedOn == 'time'){
        
          connection.execute(
            timeQuery, [yearstartdate, yearenddate, ageGroup[0], ageGroup[1], areaName],
          function(err, result)
          {
            if (err) { console.error(err); return; }
            finalData = result.rows;
            res.render('../views/compareForm.ejs', {data: finalData, gtype: 'Time'})
          });
        }

        //by location
        else if(compareBasedOn == 'location'){
          var areaId = 1;
        
            connection.execute(
              locationQuery, [ startTime, endTime, yearstartdate, yearenddate, ageGroup[0], ageGroup[1]],
              function(err, result)
                {
                  if (err) { console.error(err); return; }
                  finalData = result.rows;
                  res.render('../views/compareForm.ejs', {data: finalData, gtype: 'Location'});

                });             
        }
        //by age group
        else{
          var startAge = 0;
          var endAge = 20;
            
            connection.execute(
              ageGroupQuery, [ startTime, endTime, yearstartdate, yearenddate, areaName],
            function(err, result)
            {
              if (err) { console.error(err); return; }
              finalData = result.rows;
              res.render('../views/compareForm.ejs', {data: finalData, gtype: 'Age'})
            });

        }
      
  });
});

module.exports = router;
