const { default: axios } = require('axios')
const { PORT } = require('../const.data.js')


class gamesAPI {
    //get names by all games
    async getAll() {
        const receivedGet = await axios.get(`http://localhost:${PORT}/games`)
        return receivedGet
    }

    //get game params by game id
    async get(id) {
        const receivedGet = await axios.get(`http://localhost:${PORT}/games/${id}`)
        return receivedGet
    }
}


module.exports = new gamesAPI()