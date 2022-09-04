const { DATABASE_URL } = require("../config");
const Pool = require("pg").Pool;
let { userDB, passwordDB, hostDB, portDB, nameDB } = require("../config");
let ssl = false;

//#region heroku DB parse
if (DATABASE_URL) {
  let herokuDB = DATABASE_URL;
  herokuDB = herokuDB.replaceAll(":", `_`);
  herokuDB = herokuDB.replaceAll("/", `_`);
  herokuDB = herokuDB.replaceAll("@", `_`);
  herokuDB = herokuDB.split("_");

  userDB = herokuDB[3];
  passwordDB = herokuDB[4];
  hostDB = herokuDB[5];
  portDB = herokuDB[6];
  nameDB = herokuDB[7];
  ssl = { rejectUnauthorized: false };
}
//#endregion

const pool = new Pool({
  host: hostDB,
  port: portDB,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: ssl,
});

module.exports = pool;
