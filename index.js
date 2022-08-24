const Messages = require("./components/Messages.js");
const Polls = require("./components/Polls.js");
const { enableResultUpdates } = require("./Bot/mailing");
const { db_server } = require("./DB/server.js");
const { bot_server } = require("./Bot/server.js");
const { admin, twinkByAdmin, adminHelper, bot_url } = require("./config");
const { texts } = require("./Bot/texts.js");
const { buttons } = require("./Bot/buttons.js");
const { default: axios } = require("axios");

const {
  pollsAPI,
  gamesAPI,
  playersAPI,
  player_timeAPI,
  player_gameAPI,
  player_voteAPI,
  player_settingsAPI,
} = require("./DB/db_API");

//Launch Servers
db_server();
bot_server();

// проверка, есть ли активные опросы (при перезапуске программы). Если да, то возобновить обновление расписания

setTimeout(async () => {
  try {
    const mainPollData = (await pollsAPI.get(1)).data.message_id;
    if (mainPollData) {
      return await enableResultUpdates();
    }
  } catch (error) {
    console.log(error);
  }
}, 5 * 1000);

//#region DevRegion
const devFun = async function () {
  setTimeout(async () => {
    const hh = ("0" + currentDate.getHours().toString()).slice(-2);
    const mm = ("0" + currentDate.getMinutes().toString()).slice(-2);
    await Messages.send(
      admin,
      `Бот перезапущен.\n\nВремя на сервере: <b>${hh}:${mm}</b>`,
      buttons.deleteThisMessage
    );
    //console.log(await pollsAPI.getAll())
    //((await gamesAPI.getAll()).data).forEach(element => console.log(element.icon));
    //await Messages.send(admin, texts.cantToday, buttons.deleteThisMessage);
    //await Messages.send(admin, 123, buttons.deleteThisMessage)
    //Polls.stopAllPolls()
    //!!!ниже рассылка по !Всем активным пользователям
    //(await playersAPI.getAll(true)).data.forEach((user) => {if (user.enabled) {await Messages.send(user.id, texts.forAllInfoMessage)}});
  }, 1 * 1000);
};
devFun();

//#endregion
