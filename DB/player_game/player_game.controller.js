const db = require("../db_pool");

class Player_gameController {
  async getAllPlayer_game(req, res) {
    const player_game = await db.query(`delete * FROM player_game`);

    return res.json(player_game.rows);
  }

  async createPlayer_game(req, res) {
    const { player_id, game_id } = req.body;
    let multiQuery = ``;
    for (let count = 0; count < game_id.length; count++) {
      multiQuery += `INSERT into player_game (player_id, game_id) VALUES (${player_id}, ${game_id[count]});`;
    }
    const player_game = await db.query(multiQuery);

    return res.json(player_game.rows);
  }

  async deleteAllPlayer_game(req, res) {
    const player_game = await db.query(`delete FROM player_game`);

    return res.json(player_game.rows);
  }

  async deletePlayer_game(req, res) {
    const player_id = req.params.id;
    const player_game = await db.query(
      `delete FROM player_game WHERE player_id = ${player_id}`
    );

    return res.json(player_game.rows[0]);
  }
}

module.exports = new Player_gameController();
