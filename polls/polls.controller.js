const db = require('../db')


class PollsController {
    async getAllPolls(req, res) {
        const polls = await db.query('SELECT * FROM polls ORDER BY order_id')

        return res.json(polls.rows)
    }

    async getPoll(req, res) {   
        const order_id = req.params.id
        const polls = await db.query('SELECT (message_id) FROM polls where order_id = $1', [order_id])
        
        return res.json(polls.rows[0])   
    }

    async updateAllPolls(req, res) {
        const polls = await db.query('UPDATE polls SET poll_id = null, message_id = null')
        
        return res.json(polls.rows) 
    }

    async updatePoll(req, res) {
        const order_id = req.params.id
        const {poll_id, message_id} = req.body

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        const hours = today.getHours();
        const minutes = today.getMinutes();
        const seconds = today.getSeconds();
        const todayTimestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

        const polls = await db.query('UPDATE polls SET poll_id = $1, message_id = $2, was_created = $3 WHERE order_id = $4', [poll_id, message_id, todayTimestamp, order_id])
        
        return res.json(polls.rows[0]) 
    }
}


module.exports = new PollsController() 