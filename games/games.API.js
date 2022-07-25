const { default: axios } = require("axios");
const { httpDB } = require("../const.data.js");

class gamesAPI {
  //get names by all games
  async getAll() {
    const receivedGet = await axios.get(`${httpDB}/games`);
    return receivedGet;
  }

  //get game params by game id
  async get(id) {
    const receivedGet = await axios.get(`${httpDB}/games/${id}`);
    return receivedGet;
  }
}

module.exports = new gamesAPI();
