const { default: axios } = require("axios");
const { bot_url } = require("../../config");

class player_gameAPI {
  //get all records player + game for analytics
  async getAll() {
    const receivedGet = await axios.get(`${bot_url}/player_game`);
    return receivedGet;
  }

  //creating player's options
  async create(player_id, game_id) {
    const receivedPost = await axios.post(`${bot_url}/player_game/`, {
      player_id,
      game_id,
    });
    return receivedPost;
  }

  //clear all player_game after closing polls
  async deleteAll() {
    const receivedGet = await axios.delete(`${bot_url}/player_game`);
    return receivedGet;
  }

  //delete current player's option
  async delete(player_id) {
    const receivedGet = await axios.delete(
      `${bot_url}/player_game/${player_id}`
    );
    return receivedGet;
  }
}

module.exports = new player_gameAPI();
