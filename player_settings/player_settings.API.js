const { default: axios } = require('axios')
const { httpDB } = require('../const.data.js')


class player_settingsAPI {
    //get all id from player_settings, where bot is enabled
    async getAll(is_personal_result = true) {
        const receivedGet = await axios.get(`${httpDB}/player_settings/?is_personal_result=${is_personal_result}`)
        return receivedGet
    }

    //get player for showing current settings
    async get(id) {
        const receivedGet = await axios.get(`${httpDB}/player_settings/${id}`)
        return receivedGet
    }

    //change user settings by user's query
    async update(id, is_personal_result = true, newData) {
        newData.is_personal_result = is_personal_result
        const receivedPut = await axios.put(`${httpDB}/player_settings/${id}`, newData)
        return receivedPut
    }

    //create settings for new player
    async create(player_id) {
        const receivedPost = await axios.post(`${httpDB}/player_settings/`, {player_id})
        return receivedPost
    }
}

module.exports = new player_settingsAPI()