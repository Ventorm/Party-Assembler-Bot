const { nameDB, userDB, passwordDB } = require("../config");
const Pool = require("pg").Pool;

const pool = new Pool({
  host: `ec2-54-170-90-26.eu-west-1.compute.amazonaws.com`,
  port: 5432,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
