var oracledb = require('oracledb');
const baseQuery = 

  `SELECT ROW_NUMBER() OVER (ORDER BY Count(*) DESC ) AS Rank, Area_name, COUNT(*) AS Count
  FROM Reports
  JOIN Location ON Reports.Coordinates=Location.Coordinates
  JOIN Area ON Area.Area_ID = Location.Area_ID
  WHERE Crime_code IN (SELECT Crime_code
                          FROM Crime
                          WHERE Description like '%'||:type||'%')
  GROUP BY Area_name
  ORDER BY Count(*) `;

  const config = {
      user          : "aj3",
      password      : "Database1",
      connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    
  }
 
async function find(context) {
  let query = baseQuery;
  const binds = {};
  const opts = {};
  opts.outFormat = oracledb.OBJECT;
  opts.autoCommit = true;

    binds.type = context.type;
    if(context.ordering == "DESC"){
      query += 'DESC \nOFFSET 0 ROWS \nFETCH NEXT 7 ROWS ONLY';
    }else{
      query += 'ASC \nOFFSET 0 ROWS \nFETCH NEXT 7 ROWS ONLY';
    }
  console.log(query);
  try{
    conn = await oracledb.getConnection(config);
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