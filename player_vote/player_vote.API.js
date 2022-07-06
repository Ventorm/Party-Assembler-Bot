const { default: axios } = require('axios')
const { PORT } = require('../const.data.js')


class player_voteAPI {
    //get all records player + vote for analytics
    async getAll() {
        const receivedGet = await axios.get(`http://localhost:${PORT}/player_vote`)
        return receivedGet
    }

    //get current player's vote info
    async get(player_id) {
        const receivedGet = await axios.get(`http://localhost:${PORT}/player_vote/${player_id}`)
        return receivedGet
    }

    //for update player's options
    //async update(player_id, polls_sent = undefined, ready_to_play = undefined, result_message_id = undefined) {
    async update(player_id, values = {}) {
        //const receivedPut = await axios.put(`http://localhost:${PORT}/player_vote/${player_id}`, {polls_sent, ready_to_play, result_message_id})
        const receivedPut = await axios.put(`http://localhost:${PORT}/player_vote/${player_id}`, values)
        return receivedPut
    }

    //creating player's option
    async create(player_id) {
        const receivedPost = await axios.post(`http://localhost:${PORT}/player_vote/`, {player_id})
        return receivedPost
    }

    //clear all player_vote after closing polls
    async deleteAll() {
        const receivedGet = await axios.delete(`http://localhost:${PORT}/player_vote`)
        return receivedGet
    }
}


module.exports = new player_voteAPI()