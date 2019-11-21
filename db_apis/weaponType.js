var oracledb = require('oracledb');
 
const selectQuery = 

  `SELECT ROW_NUMBER() OVER (ORDER BY Count(*) `;

const baseQuery =
  
  ` ) AS Rank, COUNT(*) AS Count, Weapon.Description AS Weapon 
  FROM Reports
  JOIN Usedin on Reports.Dr_no=Usedin.Dr_no 
  JOIN Weapon on Usedin.Weapon_used_code=Weapon.Weapon_used_code 
  WHERE Crime_code IN (SELECT Crime_code 
                          FROM Crime
                          WHERE Description like '%'||:type||'%')
      AND Weapon.Description NOT like '%UNKNOWN%' 
  GROUP BY Weapon.Description
  ORDER BY COUNT(*) `;
 
const config = {
    user          : "aj3",
    password      : "Database1",
    connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
}

async function find(context) {
  let query = selectQuery;
  const binds = {};

    binds.type = context.type;
    if(context.ordering == "DESC"){
        query = query + 'DESC' + baseQuery + 'DESC \nOFFSET 0 ROWS \nFETCH NEXT 10 ROWS ONLY';
      }else{
        query = query + 'ASC' + baseQuery + 'ASC \nOFFSET 0 ROWS \nFETCH NEXT 10 ROWS ONLY';
      }
      console.log(query); 
  const opts = {};
  opts.outFormat = oracledb.OBJECT;
  opts.autoCommit = true;

  try{
    conn = await oracledb.getConnection(config);
    console.log(binds);
    const result = await conn.execute(query, binds, opts);
    console.log(result);

    return result.rows;
  } catch (err) {
    console.log('Ouch!', err);
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close();
    }
  }
}
 
module.exports.find = find;