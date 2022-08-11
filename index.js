const Messages = require("./components/Messages.js");
const Polls = require("./components/Polls.js");
const { enableResultUpdates } = require("./Bot/mailing");
const { db_server } = require("./DB/server.js");
const { bot_server } = require("./Bot/server.js");
const { admin } = require("dotenv").config().parsed;
const { texts } = require("./Bot/texts.js");
const { buttons } = require("./Bot/buttons.js");

const {
  pollsAPI,
  gamesAPI,
  playersAPI,
  player_timeAPI,
  player_gameAPI,
  player_voteAPI,
  player_settingsAPI,
} = require("./DB/db_API");

//#region Launch Servers

//Launch Servers
db_server();
bot_server();

// проверка, есть ли активные опросы (при перезапуске программы). Если да, то возобновить обновление расписания
setTimeout(async () => {
  const mainPollData = (await pollsAPI.get(1)).data.message_id;
  if (mainPollData) {
    return await enableResultUpdates();
  }
}, 1500);

//#endregion

//#region DevRegion

const devFun = async function () {
  setTimeout(async () => {
    //await Messages.send(admin, texts.cantToday, buttons.deleteThisMessage);
    //await Messages.send(admin, 123, buttons.deleteThisMessage)
    //await Polls.stopAllPolls()
    //!!!ниже рассылка по !Всем активным пользователям
    //((await playersAPI.getAll(true)).data).forEach(user => Messages.send(user.id, texts.forAllInfoMessage));
  }, 500);
};
devFun();

//#endregion
