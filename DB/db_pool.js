const { nameDB, userDB, passwordDB } = require("../config");
const Pool = require("pg").Pool;

const pool = new Pool({
  host: `ec2-54-170-90-26.eu-west-1.compute.amazonaws.com`,
  port: 5432,
  database: nameDB,
  user: userDB,
  password: passwordDB,
  ssl: { rejectUnauthorized: false },
  //idleTimeoutMillis: 30000,
  //connectionTimeoutMillis: 2000
});

/*
const pool = new Pool({
  user: "postgres",
  password: "f0k4b0y2f",
  host: "localhost",
  port: 5432,
  database: "votebot",
});
*/

module.exports = pool;
