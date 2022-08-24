const { default: axios } = require("axios");
const { bot_url } = require("../../config");

class gamesAPI {
  //get names by all games
  async getAll() {
    const receivedGet = await axios.get(`${bot_url}/games`);
    return receivedGet;
  }

  //get game params by game id
  async get(id) {
    const receivedGet = await axios.get(`${bot_url}/games/${id}`);
    return receivedGet;
  }
}

module.exports = new gamesAPI();
