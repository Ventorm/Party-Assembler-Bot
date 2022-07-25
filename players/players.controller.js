const db = require("../db");

class PlayersController {
  async getAllPlayers(req, res) {
    const usual_query = req.query.usual_query;
    let players;
    if (usual_query === `true`) {
      players = await db.query(`select (id) FROM players WHERE enabled = TRUE`);
    }
    if (usual_query === `false`) {
      players =
        await db.query(`select  pt.time, pg.game_id, pt.player_id from player_time as pt 
            inner join player_game as pg on pg.player_id=pt.player_id 
            inner join player_vote as pv on pv.player_id=pt.player_id WHERE (filled_all_polls = true AND ready_to_play = true)
            order by pt.time desc, pg.game_id`);
    }
    return res.json(players.rows);
  }

  async getPlayer(req, res) {
    const id = req.params.id;
    const players = await db.query(`select * FROM players WHERE id = ${id}`);

    return res.json(players.rows[0]);
  }

  async updatePlayer(req, res) {
    const { enabled, id } = req.body;
    const players = await db.query(
      `update players SET enabled = ${enabled} WHERE id = ${id} RETURNING *`
    );

    return res.json(players.rows[0]);
  }

  async createPlayer(req, res) {
    const { id, username, first_name, last_name, invited_from } = req.body;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const todayTimestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    const players = await db.query(
      `insert INTO players (id, username, first_name, last_name, enabled, was_created, invited_from) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, username, first_name, last_name, true, todayTimestamp, invited_from]
    );

    return res.json(players.rows[0]);
  }
}

module.exports = new PlayersController();
