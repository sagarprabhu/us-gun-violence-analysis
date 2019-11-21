var oracledb = require('oracledb');
const selectQuery = 

  `SELECT ROW_NUMBER() OVER (ORDER BY Count(*) `;

const baseQuery =
  
  ` ) AS RANK, COUNT(*) AS COUNT, Descent.DESCRIPTION
  FROM Reports
  JOIN Victim ON Victim.Victim_id = Reports.Victim_id
  JOIN Descent ON Descent.Descent_code = Victim.Descent
  WHERE Crime_code IN (SELECT Crime_code
                          FROM Crime
                          WHERE Description like '%'||:type||'%')
  GROUP BY Descent.Description
  ORDER BY Count(*) `;

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
        query = query + 'DESC' + baseQuery + 'DESC \nOFFSET 0 ROWS \nFETCH NEXT 5 ROWS ONLY';
      }else{
        query = query + 'ASC' + baseQuery + 'ASC \nOFFSET 0 ROWS \nFETCH NEXT 5 ROWS ONLY';
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