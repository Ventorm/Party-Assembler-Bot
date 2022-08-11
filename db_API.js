const playersAPI = require("./players/players.API.js");
const gamesAPI = require("./games/games.API.js");
const pollsAPI = require("./polls/polls.API.js");
const player_timeAPI = require("./player_time/player_time.API.js");
const player_gameAPI = require("./player_game/player_game.API.js");
const player_voteAPI = require("./player_vote/player_vote.API.js");
const player_settingsAPI = require("./player_settings/player_settings.API.js");

module.exports = {
  playersAPI,
  gamesAPI,
  pollsAPI,
  player_timeAPI,
  player_gameAPI,
  player_voteAPI,
  player_settingsAPI,
};
