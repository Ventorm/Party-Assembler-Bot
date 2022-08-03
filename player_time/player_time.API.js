const { default: axios } = require("axios");
const { httpDB, PORT } = require("dotenv").config({ path: "Vote_Bot/.env" }).parsed;

class player_timeAPI {
  //get all records player + time for analytics
  async getAll() {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/player_time`);
    return receivedGet;
  }

  //get current player's time info
  async get(player_id) {
    const receivedGet = await axios.get(`${httpDB}:${PORT}/player_time/${player_id}`);
    return receivedGet;
  }

  //creating player's options
  async create(player_id, time_options) {
    const receivedPost = await axios.post(`${httpDB}:${PORT}/player_time/`, {
      player_id,
      time_options,
    });
    return receivedPost;
  }

  //clear all player_time after closing polls
  async deleteAll() {
    const receivedGet = await axios.delete(`${httpDB}:${PORT}/player_time`);
    return receivedGet;
  }

  //delete current player's option
  async delete(player_id) {
    const receivedGet = await axios.delete(
      `${httpDB}:${PORT}/player_time/${player_id}`
    );
    return receivedGet;
  }
}

module.exports = new player_timeAPI();
