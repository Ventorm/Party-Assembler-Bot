const { bot } = require("./live_catch");

//Bot launch

const bot_server = function () {
  try {
    bot.launch();
    console.log("Server Bot is started");
  } catch (error) {
    console.log(error);
    console.log("Bot could not start, all Error at the Top");
  }
};

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//#endregion

module.exports = { bot_server };
