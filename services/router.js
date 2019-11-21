const express = require('express');
const router = new express.Router();
var oracledb = require('oracledb');
const totalCount = require('../db_apis/totalCount.js');
const rankCrimesDB = require('../db_apis/crimeType.js');
const rankWeaponDB = require('../db_apis/weaponType.js');
const rankVictimDB = require('../db_apis/victimDescent.js');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.route('/').get(function (req, res){
    return res.render('../views/crimeData.ejs', {data: "", type: "", total: ""})
})

router.route('/')
  .post(async function get(req, res, next) {
    try {
      const context = {};
      let rows;
      context.type = req.body.type;
      context.ordering = req.body.ordering;
      if(req.body.ranking =="area_crime"){
        rows = await rankCrimesDB.find(context);
      } else if(req.body.ranking =="weapon_crime"){
        rows = await rankWeaponDB.find(context);
      } else if(req.body.ranking =="victim_crime"){
        rows = await rankVictimDB.find(context);
      }
      countAll = await totalCount.find(context);
      if (rows.length > 0) {
            return res.render('../views/crimeData.ejs', {data: rows, type: req.body.ranking, total: countAll})
        } else {
          res.status(404).end();
        }
    } catch (err) {
      next(err);
  }
   
  });

module.exports = router;


