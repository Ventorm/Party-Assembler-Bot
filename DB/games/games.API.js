const { default: axios } = require("axios");
const { httpDB, PORT } = require("dotenv").config().parsed;

class gamesAPI {
  //get names by all games
  async getAll() {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/games`);
    return receivedGet;
  }

  //get game params by game id
  async get(id) {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/games/${id}`);
    return receivedGet;
  }
}

module.exports = new gamesAPI();
