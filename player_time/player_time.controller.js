const db = require('../db')


class Player_timeController {
    async getAllPlayer_time(req, res) {
        const player_time = await db.query('SELECT * FROM player_time')

        return res.json(player_time.rows)
    }

    async getPlayer_time(req, res) {
        const player_id = req.params.id;
        const player_time = await db.query('SELECT time FROM player_time WHERE player_id = $1 order by player_id desc', [player_id])

        return res.json(player_time.rows)
    }


    async createPlayer_time(req, res) {
        const {player_id, time} = req.body
        let multiQuery = ``;
        for (let count = 0; count < time.length; count++) {
            multiQuery += `INSERT into player_time (player_id, time) VALUES (${player_id}, ${22 - time[count]});`
        }
        const player_time = await db.query(multiQuery)
        
        return res.json(player_time.rows)
    }

    async deleteAllPlayer_time(req, res) {
        const player_time = await db.query('DELETE FROM player_time')

        return res.json(player_time.rows)
    }

    async deletePlayer_time(req, res) {
        const player_id = req.params.id
        const player_time = await db.query('DELETE FROM player_time WHERE player_id = $1', [player_id])

        return res.json(player_time.rows[0])
    }

}

module.exports = new Player_timeController() 