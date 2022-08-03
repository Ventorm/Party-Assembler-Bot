const { default: axios } = require("axios");
const { httpDB, PORT } = require("dotenv").config({ path: "Vote_Bot/.env" }).parsed;

class player_voteAPI {
  //get all records player + vote for analytics
  async getAll() {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/player_vote`);
    return receivedGet;
  }

  //get current player's vote info
  async get(player_id) {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/player_vote/${player_id}`);
    return receivedGet;
  }

  //for update player's options
  async update(player_id, values = {}) {
    const receivedPut = await axios.put(
      `${httpDB}:${PORT}/player_vote/${player_id}`,
      values
    );
    return receivedPut;
  }

  //creating player's option
  async create(player_id) {
    const receivedPost = await axios.post(`${httpDB}:${PORT}/player_vote/`, {
      player_id,
    });
    return receivedPost;
  }

  //clear all player_vote after closing polls
  async deleteAll() {
    const receivedGet = await axios.delete(`${httpDB}:${PORT}/player_vote`);
    return receivedGet;
  }
}

module.exports = new player_voteAPI();
