const { hostDB, nameDB, userDB, passwordDB } = require("../config");
const Pool = require("pg").Pool;

const pool = new Pool({
  host: hostDB,
  port: 5432,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
