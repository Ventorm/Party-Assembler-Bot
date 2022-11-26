const Pool = require("pg").Pool;
const { userDB, passwordDB, hostDB, portDB, nameDB } = require("../config");

const pool = new Pool({
  host: hostDB,
  port: portDB,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: ssl,
});

module.exports = pool;
