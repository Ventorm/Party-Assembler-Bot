const db = require('../db')


class Player_voteController {
    async getAllPlayer_vote(req, res) {
        //const player_vote = await db.query('SELECT * FROM player_vote WHERE ready_to_play = true')
        const player_vote = await db.query('SELECT * FROM player_vote WHERE filled_all_polls = true')

        return res.json(player_vote.rows)
    }
    
    async getPlayer_vote(req, res) {
        const player_id = req.params.id;
        const player_vote = await db.query('SELECT * FROM player_vote WHERE player_id = $1', [player_id])

        return res.json(player_vote.rows[0])
    }

    async updatePlayer_vote(req, res) {
        const player_id = req.params.id;
        const {
            polls_sent, 
            ready_to_play, 
            filled_all_polls, 
            full_result_message_id, 
            personal_result_message_id} = req.body

        let multiQuery = '';
        if (polls_sent !== undefined) {
            multiQuery += (`Update player_vote SET polls_sent = ${polls_sent} WHERE player_id = ${player_id};`)
        }
        if (ready_to_play !== undefined) {
            multiQuery += (`Update player_vote SET ready_to_play = ${ready_to_play} WHERE player_id = ${player_id};`)
        }
        if (filled_all_polls === true) {
            multiQuery += (`Update player_vote SET filled_all_polls = true WHERE player_id = ${player_id};`)
        }
        if (full_result_message_id !== undefined) {
            multiQuery += (`Update player_vote SET full_result_message_id = ${full_result_message_id} WHERE player_id = ${player_id};`)
        }
        if (personal_result_message_id !== undefined) {
            multiQuery += (`Update player_vote SET personal_result_message_id = ${personal_result_message_id} WHERE player_id = ${player_id};`)
        }

        const player_vote = await db.query(multiQuery)
        
        return res.json(player_vote.rows)  
    }

    async createPlayer_vote(req, res) {
        const {player_id} = req.body
        const player_vote = await db.query(`INSERT into player_vote (player_id, polls_sent, filled_all_polls) VALUES ($1, $2, $3)`, [player_id, 1, false])
        
        return res.json(player_vote.rows[0])
    }

    async deleteAllPlayer_vote(req, res) {
        const player_vote = await db.query('DELETE FROM player_vote')

        return res.json(player_vote.rows)
    }

}

module.exports = new Player_voteController() 