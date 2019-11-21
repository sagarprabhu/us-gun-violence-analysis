
var oracledb = require('oracledb');
const baseQuery = 

  `SELECT COUNT(*) AS COUNT FROM Reports
    WHERE Crime_code IN (SELECT Crime_code 
    FROM Crime
    WHERE Description like '%'||:type||'%')`;

    const config = {
      user          : "aj3",
      password      : "Database1",
      connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    
  }
 
async function find(context) {
  let query = baseQuery;
  const binds = {}; 
  binds.type = context.type;
  const opts = {};
  opts.outFormat = oracledb.OBJECT;
  opts.autoCommit = true;
  console.log(query);
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