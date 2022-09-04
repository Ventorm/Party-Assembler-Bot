const express = require("express");
const { DATABASE_URL, bot_url } = require("../config");

let PORT;
if (!DATABASE_URL) {
  PORT = bot_url.split(":")[2];
}

const app = express();
app.use(express.json());

const playersRouter = require("./players/players.routes");
app.use("/", playersRouter);

const gamesRouter = require("./games/games.routes");
app.use("/", gamesRouter);

const pollsRouter = require("./polls/polls.routes");
app.use("/", pollsRouter);

const player_timeRouter = require("./player_time/player_time.routes");
app.use("/", player_timeRouter);

const player_gameRouter = require("./player_game/player_game.routes");
app.use("/", player_gameRouter);

const player_voteRouter = require("./player_vote/player_vote.routes");
app.use("/", player_voteRouter);

const player_settingsRouter = require("./player_settings/player_settings.routes");
app.use("/", player_settingsRouter);

const db_server = function () {
  try {
    app.listen(PORT, console.log(`Server DB is started on port ${PORT}`));
  } catch (error) {
    console.log(error);
    console.log("DB could not start, all Error at the Top");
  }
};

module.exports = { db_server };
