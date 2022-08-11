const db = require("../db_pool");

class GamesController {
  async getAllGames(req, res) {
    const games = await db.query(`select * FROM games ORDER BY id`);

    return res.json(games.rows);
  }

  async getGame(req, res) {
    const id = req.params.id;
    const games = await db.query(
      `select (name, min_players, max_players) FROM games WHERE id = ${id}`
    );

    return res.json(games.rows[0]);
  }
}

module.exports = new GamesController();
