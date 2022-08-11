const db = require("../db_pool");

class Player_settingsController {
  async getAllPlayer_settings(req, res) {
    const is_personal_result = req.query.is_personal_result;

    const player_settings = await db.query(
      `select * from player_settings where (is_personal_result = ${is_personal_result} AND enabled = true);`
    );

    return res.json(player_settings.rows);
  }

  async getPlayer(req, res) {
    const player_id = req.params.id;

    const player_settings = await db.query(
      `select * FROM player_settings WHERE (player_id = ${player_id}) ORDER BY is_personal_result desc`
    );

    return res.json(player_settings.rows);
  }

  async updatePlayer(req, res) {
    const { is_personal_result, enabled, before_reminder } = req.body;
    const player_id = req.params.id;
    let multiQuery = "";

    if (typeof enabled === `boolean`) {
      multiQuery += `Update player_settings SET enabled = ${enabled} WHERE (player_id = ${player_id} AND is_personal_result = ${is_personal_result}) RETURNING *;`;
    }
    if (typeof before_reminder === `number`) {
      // 45, 30, 15, 5, -1
      multiQuery += `Update player_settings SET before_reminder = ${before_reminder} WHERE (player_id = ${player_id} AND is_personal_result = ${is_personal_result}) RETURNING *;`;
    }

    const player_settings = await db.query(multiQuery);

    return res.json(player_settings.rows);
  }

  async createPlayer(req, res) {
    const { player_id } = req.body;
    let multiQuery = "";

    multiQuery += `INSERT into player_settings (player_id, is_personal_result, enabled, before_reminder) VALUES (${player_id}, true, true, 30);`;

    multiQuery += `INSERT into player_settings (player_id, is_personal_result, enabled, before_reminder) VALUES (${player_id}, false, true, -1);`;

    const player_settings = await db.query(multiQuery);

    return res.json(player_settings.rows);
  }
}

module.exports = new Player_settingsController();
