const db = require("../db");
//const { httpDB, PORT } = require("dotenv").config({ path: "Vote_Bot/.env" }).parsed;
const env_vars = require("dotenv").config().parsed;
const end_time = parseInt(env_vars.end_time);

class Player_timeController {
  async getAllPlayer_time(req, res) {
    const player_time = await db.query(`select * FROM player_time`);

    return res.json(player_time.rows);
  }

  async getPlayer_time(req, res) {
    const player_id = req.params.id;
    const player_time = await db.query(
      `select time FROM player_time WHERE player_id = ${player_id} order by player_id desc`
    );

    return res.json(player_time.rows);
  }

  async createPlayer_time(req, res) {
    const { player_id, time_options } = req.body;
    let multiQuery = ``;
    // time_options - это опции времени, которые мы будем добавлять в БД для дальнейшего анализа
    for (let count = 0; count < time_options.length; count++) {
      multiQuery += `INSERT into player_time (player_id, time) VALUES (${player_id}, ${
        end_time - time_options[count]
      });`;
    }
    const player_time = await db.query(multiQuery);

    return res.json(player_time.rows);
  }

  async deleteAllPlayer_time(req, res) {
    const player_time = await db.query(`delete FROM player_time`);

    return res.json(player_time.rows);
  }

  async deletePlayer_time(req, res) {
    const player_id = req.params.id;
    const player_time = await db.query(
      `delete FROM player_time WHERE player_id = $1`,
      [player_id]
    );

    return res.json(player_time.rows[0]);
  }
}

module.exports = new Player_timeController();
