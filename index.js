const Messages = require("./components/Messages.js");
const Polls = require("./components/Polls.js");
const { enableResultUpdates } = require("./Bot/mailing");
const { db_server } = require("./DB/server.js");
const { bot_server } = require("./Bot/server.js");
const { admin, twinkByAdmin, adminHelper, bot_url } = require("./config");
const { texts } = require("./Bot/texts.js");
const { buttons } = require("./Bot/buttons.js");
const schedule = require("node-schedule");

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
}, 2 * 1000);

//#region DevRegion
const devFun = async function () {
  setTimeout(async () => {
    const hh = ("0" + new Date().getHours() .toString()).slice(-2);
    const mm = ("0" + new Date().getMinutes().toString()).slice(-2);
    await Messages.send(
      admin,
      `Бот перезапущен.\n\nВремя на сервере: <b>${hh}:${mm}</b>`,
      buttons.deleteThisMessage
    );
    const doNotLetDynoToSleepAfter30Mins = schedule.scheduleJob(`*/20 * * * *`, async function () {await pollsAPI.get(1);});
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
