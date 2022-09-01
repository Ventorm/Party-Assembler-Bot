const { DATABASE_URL } = require("../config");
const Pool = require("pg").Pool;

//#region heroku DB parse
let herokuDB = DATABASE_URL
herokuDB = herokuDB.replaceAll(':', `_`)
herokuDB = herokuDB.replaceAll('/', `_`)
herokuDB = herokuDB.replaceAll('@', `_`)
herokuDB = herokuDB.split('_')

const userDB = herokuDB[3]
const passwordDB = herokuDB[4]
const hostDB = herokuDB[5]
const portDB = herokuDB[6]
const nameDB = herokuDB[7]
//#endregion

const pool = new Pool({
  host: hostDB,
  port: portDB,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
