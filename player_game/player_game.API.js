const { default: axios } = require('axios')
const { PORT } = require('../const.data.js')


class player_gameAPI {
    //get all records player + game for analytics
    async getAll() {
        const receivedGet = await axios.get(`http://localhost:${PORT}/player_game`)
        return receivedGet
    }
    
    //creating player's options
    async create(player_id, game_id) {
        const receivedPost = await axios.post(`http://localhost:${PORT}/player_game/`, {player_id, game_id})
        return receivedPost
    }

    //clear all player_game after closing polls
    async deleteAll() {
        const receivedGet = await axios.delete(`http://localhost:${PORT}/player_game`)
        return receivedGet
    }

    //delete current player's option
    async delete(player_id) {
        const receivedGet = await axios.delete(`http://localhost:${PORT}/player_game/${player_id}`)
        return receivedGet
    }
}


module.exports = new player_gameAPI()