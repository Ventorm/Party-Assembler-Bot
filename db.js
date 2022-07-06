const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    password: 'f0k4b0y2f',
    host: 'localhost',
    port: 5432,
    database: 'votebot'
})

module.exports = pool
