const { default: axios } = require("axios");
const { bot_url } = require("../../config");

class playersAPI {
  //get all id from players, where bot is enabled
  async getAll(usual_query = true) {
    const receivedGet = await axios.get(
      `${bot_url}/players/?usual_query=${usual_query}`
    );
    return receivedGet;
  }

  //get player for check
  async get(id) {
    const receivedGet = await axios.get(`${bot_url}/players/${id}`);
    return receivedGet;
  }

  //if player has Blocked or Unblocked bot
  async update(id, enabled) {
    const receivedPut = await axios.put(`${bot_url}/players/${id}`, {
      id,
      enabled,
    });
    return receivedPut;
  }

  //creating new player
  async create(data) {
    const receivedPost = await axios.post(`${bot_url}/players/`, data);
    return receivedPost;
  }
}

module.exports = new playersAPI();
