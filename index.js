const express = require("express");
const { default: axios } = require("axios");
const { Telegraf } = require("telegraf");
const schedule = require("node-schedule");

const { texts } = require("./texts");
const {
  buttons,
  settingsButtons,
  personalActions,
  fullActions,
} = require("./buttons");
const {
  PORT,
  token,
  end_time,
  admin,
  twinkByAdmin,
  //before_reminder,
  //httpDB,
  //mainGroup,
  //adminHelper,
  //botID,
} = require("./const.data.js");
const playersAPI = require("./players/players.API.js");
const gamesAPI = require("./games/games.API.js");
const pollsAPI = require("./polls/polls.API.js");
const player_timeAPI = require("./player_time/player_time.API.js");
const player_gameAPI = require("./player_game/player_game.API.js");
const player_voteAPI = require("./player_vote/player_vote.API.js");
const player_settingsAPI = require("./player_settings/player_settings.API.js");

const bot = new Telegraf(token);

//#region Functions
const getStarted = async function (ctx) {
  const id = ctx.update.message.from.id;
  const user = (await playersAPI.get(id)).data;
  if (!user) {
    await ctx.reply(texts.welcome);
    setTimeout(async () => {
      await ctx.reply(texts.confirm);
    }, 1500);
  }
};

const newPlayer = async function (ctx, invited_from) {
  const user = ctx.update.message.from;
  const data = {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    invited_from: invited_from,
  };

  const newUser = await playersAPI.create(data);
  const userSettings = await player_settingsAPI.create(user.id);

  return newUser;
};

const addToMailing = async function (user_id) {
  const polls = (await pollsAPI.getAll()).data;
  if (polls[0].message_id) {
    const player_vote = await (await player_voteAPI.get(user_id)).data;
    if (!player_vote) {
      sendMessage(user_id, texts.justJoined);
      setTimeout(async () => {
        forwardMessage(user_id, polls[0].message_id);
        player_voteAPI.create(user_id);
      }, 3000);
    }
  }
};

const actionProcessing = async function (ctx) {
  let player_id;
  if (ctx.update.message) {
    player_id = ctx.update.message.from.id;
  }
  if (ctx.update.callback_query) {
    player_id = ctx.update.callback_query.from.id;
  }

  const data = ctx.update.callback_query.data;
  let createdButtons;
  let updatedData;
  let player_vote;

  switch (data) {
    // проверка, на какую кнопку из Персональных настроек было нажатие
    case `showFullSettings`:
      createdButtons = await settingsButtons(ctx, false);
      await ctx.deleteMessage();
      await ctx.replyWithHTML(texts.forButtonFullReminder, createdButtons);
      break;

    case `personal_45`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, {
          before_reminder: 45,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `personal_30`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, {
          before_reminder: 30,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `personal_15`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, {
          before_reminder: 15,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `personal_5`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, { before_reminder: 5 })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `personal_-1`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, {
          before_reminder: -1,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `disablePersonalResult`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, { enabled: false })
      ).data[0];
      player_vote = (await player_voteAPI.get(player_id)).data;
      if (player_vote) {
        if (player_vote.filled_all_polls) {
          if (player_vote.personal_result_message_id) {
            await player_voteAPI.update(player_id, {
              personal_result_message_id: null,
            });
            await deleteMessage(
              player_id,
              player_vote.personal_result_message_id
            );
          }
        }
      }
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    case `enablePersonalResult`:
      updatedData = (
        await player_settingsAPI.update(player_id, true, { enabled: true })
      ).data[0];
      player_vote = (await player_voteAPI.get(player_id)).data;
      if (player_vote) {
        if (player_vote.filled_all_polls) {
          if (player_vote.personal_result_message_id === null) {
            await sendAllResultMessages(player_id, player_vote);
          }
        }
      }
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonPersonalReminder,
        await settingsButtons(ctx, true, updatedData)
      );
      break;

    // проверка, на какую кнопку из Общих настроек было нажатие
    case `showPersonalSettings`:
      createdButtons = await settingsButtons(ctx, true);
      await ctx.deleteMessage();
      await ctx.replyWithHTML(texts.forButtonPersonalReminder, createdButtons);
      await ctx.answerCbQuery();
      break;

    case `full_45`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, {
          before_reminder: 45,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `full_30`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, {
          before_reminder: 30,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `full_15`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, {
          before_reminder: 15,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `full_5`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, {
          before_reminder: 5,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `full_-1`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, {
          before_reminder: -1,
        })
      ).data[0];
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `disableFullResult`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, { enabled: false })
      ).data[0];
      player_vote = (await player_voteAPI.get(player_id)).data;
      if (player_vote) {
        if (player_vote.filled_all_polls) {
          if (player_vote.full_result_message_id) {
            await player_voteAPI.update(player_id, {
              full_result_message_id: null,
            });
            await deleteMessage(player_id, player_vote.full_result_message_id);
          }
        }
      }
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;

    case `enableFullResult`:
      updatedData = (
        await player_settingsAPI.update(player_id, false, { enabled: true })
      ).data[0];
      player_vote = (await player_voteAPI.get(player_id)).data;
      if (player_vote) {
        if (player_vote.filled_all_polls) {
          if (player_vote.full_result_message_id === null) {
            await sendAllResultMessages(player_id, player_vote);
          }
        }
      }
      await ctx.deleteMessage();
      await ctx.replyWithHTML(
        texts.forButtonFullReminder,
        await settingsButtons(ctx, false, updatedData)
      );
      break;
  }
};

const sendQuiz = async function (
  chat_id,
  question,
  options,
  correct_option_id = 0,
  explanation = "",
  anonymous = false,
  type = "quiz",
  method = "sendPoll"
) {
  question = encodeURIComponent(question);
  options = encodeURIComponent(JSON.stringify(options));
  explanation = encodeURIComponent(explanation);
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&question=${question}&options=${options}&is_anonymous=${anonymous}&type=${type}&correct_option_id=${correct_option_id}&explanation=${explanation}`;

  const result = (await axios.post(url)).data.result.message_id;
};

const sendPoll = async function (
  chat_id,
  question,
  options,
  multiple_answers = true,
  anonymous = false,
  type = "regular",
  method = "sendPoll"
) {
  question = encodeURIComponent(question);
  options = encodeURIComponent(JSON.stringify(options));
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&question=${question}&options=${options}&is_anonymous=${anonymous}&allows_multiple_answers=${multiple_answers}&type=${type}`;

  try {
    const result = (await axios.post(url)).data.result;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const stopPolls = async function () {
  const method = "stopPoll";
  const polls = (await pollsAPI.getAll()).data;
  polls.forEach(async (poll) => {
    if (poll.message_id) {
      const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${twinkByAdmin}&message_id=${poll.message_id}`;
      try {
        const result = (await axios.get(url)).data.result;
      } catch (error) {
        console.log(error.response.data.description);
      }
    }
  });
  await player_voteAPI.deleteAll();
  await player_gameAPI.deleteAll();
  await player_timeAPI.deleteAll();
  return await pollsAPI.updateAll();
};

const createCurrentTimeStamp = function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};

const sendMessage = async function (
  chat_id,
  content,
  pinnedButtons = false,
  parse_mode = "HTML"
) {
  const method = "sendMessage";
  const type = "text";
  content = encodeURIComponent(content);
  let url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&${type}=${content}&parse_mode=${parse_mode}`;

  if (pinnedButtons) {
    url += `&reply_markup=${encodeURIComponent(
      JSON.stringify(pinnedButtons.reply_markup)
    )}`;
  }

  try {
    const result = (await axios.post(url)).data.result.message_id;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const editMessage = async function (
  chat_id,
  newText = "",
  message_id,
  pinnedButtons = false,
  parse_mode = "HTML"
) {
  const method = "editMessageText";
  newText = encodeURIComponent(newText);
  let url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&message_id=${message_id}&text=${newText}&parse_mode=${parse_mode}`;

  if (pinnedButtons) {
    url += `&reply_markup=${encodeURIComponent(
      JSON.stringify(pinnedButtons.reply_markup)
    )}`;
  }

  try {
    const result = (await axios.get(url)).data.result.message_id;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const forwardMessage = async function (
  chat_id,
  message_id,
  method = "forwardMessage"
) {
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&from_chat_id=${twinkByAdmin}&message_id=${message_id}`;

  try {
    const result = (await axios.post(url)).data.result.message_id;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const deleteMessage = async function (
  chat_id,
  message_id,
  method = "deleteMessage"
) {
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;

  try {
    const result = (await axios.post(url)).data;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const pinMessage = async function (
  chat_id,
  message_id,
  disable_notification = true,
  method = "pinChatMessage"
) {
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&message_id=${message_id}&disable_notification=${disable_notification}`;
  //const result = (await axios.post(url)).data.result.message_id
  try {
    const result = (await axios.post(url)).data;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const unpinMessage = async function (
  chat_id,
  message_id,
  method = "unpinChatMessage"
) {
  const url = `https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;
  //const result = (await axios.post(url)).data.result.message_id
  try {
    const result = (await axios.post(url)).data;
    return result;
  } catch (error) {
    console.log(error.response.data.description);
  }
};

const textProcessing = async function (ctx) {
  const sender = ctx.message.from;
  const incomingText = ctx.message.text;
  const created = (await playersAPI.get(sender.id)).data;
  if (created) {
    return "";
  } else {
    const referal = parseInt(incomingText);
    if (!isNaN(referal)) {
      if (typeof referal === "number") {
        const referalData = (await playersAPI.get(referal)).data;
        if (referalData) {
          await newPlayer(ctx, referal);
          await sendMessage(sender.id, texts.allowed);
          setTimeout(async () => {
            await ctx.reply(texts.shortInfo, buttons.groupInvitation);
          }, 1500);
          setTimeout(async () => {
            await addToMailing(sender.id);
          }, 3000);
        }
      }
    }
  }
};

const pollsCreatedToday = async function () {
  //берём дату создания последнего опроса (игры)
  const currentDate = new Date();
  const polls = (await pollsAPI.getAll()).data;
  const was_created = new Date(Date.parse(polls[0].was_created));

  const dayComparsion = currentDate.getDate() - was_created.getDate();
  const monthComparsion = currentDate.getMonth() - was_created.getMonth();

  if (dayComparsion === 0 && monthComparsion === 0) {
    return true;
  }
  return false;
};

//const beforeMailing = async function (polls, sender) {
const beforeMailing = async function (sender) {
  if (await pollsCreatedToday()) {
    return sendMessage(sender.id, texts.alreadyFinished);
  } else {
    const currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    if (hours === end_time + 1 || (hours === end_time && minutes >= 30)) {
      return sendMessage(sender.id, texts.too_late);
    }
    if (hours < 8 || (hours === 8 && minutes < 30)) {
      return sendMessage(sender.id, texts.too_early);
    }
    return mailing(hours, minutes, sender);
  }
};

const mailing = async function (hours, minutes, sender) {
  if (hours < end_time - 1 || (hours === end_time - 1 && minutes < 30)) {
    const checkPoll = await createCheckPoll(true);
    const gamePoll = await createGamePoll();
    const timePoll = await createTimePoll();

    await pollsAPI.update(1, checkPoll.poll.id, checkPoll.message_id);
    await pollsAPI.update(2, gamePoll.poll.id, gamePoll.message_id);
    await pollsAPI.update(3, timePoll.poll.id, timePoll.message_id);

    enableResultUpdates();

    mailingFirstPoll(checkPoll.message_id);
  } else {
    const checkPoll = await createCheckPoll(false);
    const gamePoll = await createGamePoll();

    await pollsAPI.update(1, checkPoll.poll.id, checkPoll.message_id);
    await pollsAPI.update(2, gamePoll.poll.id, gamePoll.message_id);

    enableResultUpdates();

    mailingFirstPoll(checkPoll.message_id);
  }

  if (sender.id !== admin) {
    if (!sender.username) {
      sender.username = ``;
    }
    if (!sender.first_name) {
      sender.first_name = ``;
    }
    if (!sender.last_name) {
      sender.last_name = ``;
    }
    sendMessage(
      admin,
      `Инициатор опросов:\n<b>${sender.first_name} ${sender.last_name}\n${sender.username}</b>`
    );
  }
};

const mailingFirstPoll = async function (message_id) {
  const players = (await playersAPI.getAll()).data;
  players.forEach((element) => {
    player_voteAPI.create(element.id);
    forwardMessage(element.id, message_id);
  });
  return "Рассылка завершена (первый опрос)";
};

const createCheckPoll = async function (normal = true) {
  if (normal) {
    const result = await sendPoll(
      twinkByAdmin,
      texts.letsPlay.question,
      texts.letsPlay.answers,
      false
    );
    return result;
  }
  if (!normal) {
    const result = await sendPoll(
      twinkByAdmin,
      texts.letsPlayRightNow.question,
      texts.letsPlayRightNow.answers,
      false
    );
    return result;
  }
};

const createTimePoll = async function () {
  const time_options = await createTimeOptions(true);

  const result = await sendPoll(twinkByAdmin, texts.chooseTime, time_options);
  return result;
};

const createGamePoll = async function () {
  const allGames = (await gamesAPI.getAll()).data;
  let games = [];
  allGames.forEach((game) => {
    games.push(game.name);
  });

  const result = await sendPoll(twinkByAdmin, texts.chooseGame, games);
  return result;
};

const enableResultUpdates = async function () {
  const intervalCheck = schedule.scheduleJob(`*/5 * * * *`, async function () {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours === end_time + 1 || (hours === end_time && minutes >= 30)) {
      await stopPolls();
      return await schedule.gracefulShutdown();
    }

    await updateAllResultMessages();
  });
};

const createEmptyResult = async function () {
  const games = (await gamesAPI.getAll()).data;
  let emptyResult = [];
  const available_time_options = await createTimeOptions(false);

  for (let time_id = 0; time_id < available_time_options.length; time_id++) {
    emptyResult.push([]);
    games.forEach((game) => {
      emptyResult[time_id].push({
        name: game.name,
        current_players: [],
        min_players: game.min_players,
        max_players: game.max_players,
        //'current_count': 0
      });
    });
  }

  return emptyResult;
};

const createFilledResult = async function () {
  const filledResult = [];
  const emptyResult = await createEmptyResult();
  const games = (await gamesAPI.getAll()).data;
  const game_time_players = (await playersAPI.getAll(false)).data;

  for (let time_id = 0; time_id < emptyResult.length; time_id++) {
    // добавляем пустой массив за каждую опцию времени для её последующего наполнения
    filledResult.push([]);
    for (let game_id = 0; game_id < games.length; game_id++) {
      // определяем игроков, соответствующих своим играм и времени
      game_time_players.forEach((player_option) => {
        if (
          player_option.time === end_time - time_id &&
          player_option.game_id === game_id
        ) {
          emptyResult[time_id][game_id].current_players.push(
            player_option.player_id
          );
          //emptyResult[time_id][game_id].current_count++
        }
      });
      // сравниваем каждое время и игру, достаточно ли набралось игроков. Если да, то заполняем итоговый результат этой игрой в соответствующий массив времени
      const min_players = emptyResult[time_id][game_id].min_players;
      const current_players =
        emptyResult[time_id][game_id].current_players.length;
      if (current_players >= min_players) {
        filledResult[time_id].push(emptyResult[time_id][game_id]);
      }
    }
  }

  return filledResult;
};

const createPersonalResult = async function (player_id, filledResult) {
  const game_time_players = (await playersAPI.getAll(false)).data;
  player_id = player_id.toString();
  let player_times = new Set();
  // проверяем записи из БД на наличие в них игрока для проверки на статус
  for (
    let game_time_option = 0;
    game_time_option < game_time_players.length;
    game_time_option++
  ) {
    if (game_time_players[game_time_option].player_id === player_id) {
      player_times.add(game_time_players[game_time_option].time);
    }
  }

  // проверка, есть ли игрок в общей выборке из БД
  if (player_times.size === 0) {
    const ready_to_play = (await player_voteAPI.get(player_id)).data
      .ready_to_play;
    // проверка, передумал ли игрок
    if (!ready_to_play) {
      return `cant_play`;
    }
    // если некорректно заполнил опросы, например отменил время и/или игры, но поставил снова
    else {
      return `incorrectly_filled_by_user`;
    }
  }

  // проверка, остались ли выбранные игроком опции времени актуальными на остаток дня
  const currentHour = new Date().getHours();
  let actialTimes = false;
  player_times.forEach((time) => {
    if (time >= currentHour) {
      actialTimes = true;
    }
  });
  if (!actialTimes) {
    return `no_time_left`;
  }

  // наполняем персональное расписание играми
  let personal_filled_result = [];
  let total_games = 0;
  for (let time_option = 0; time_option < filledResult.length; time_option++) {
    // добавляем пустой массив за каждую опцию времени для её последующего наполнения
    personal_filled_result.push([]);
    for (
      let game_option = 0;
      game_option < filledResult[time_option].length;
      game_option++
    ) {
      // добавляем каждую игру в соответствующее время, если пользователь указан в списке желающих
      let current_game_time = filledResult[time_option][game_option];
      if (current_game_time.current_players.includes(player_id)) {
        personal_filled_result[time_option].push(current_game_time);
        total_games++;
      }
    }
  }
  // если нет ни 1 подходящей игроку игры
  if (total_games === 0) {
    return `not_enough_players`;
  }

  return personal_filled_result;
};

const setResultToNormal = async function (
  resultObject,
  fullResult = true,
  player_id
) {
  let normalResult = ``;
  const currentDate = new Date();
  const currentTime =
    ("0" + currentDate.getHours().toString()).slice(-2) +
    ":" +
    ("0" + currentDate.getMinutes().toString()).slice(-2);
  if (!fullResult) {
    normalResult += `<b>ПЕРСОНАЛЬНОЕ РАСПИСАНИЕ  🎯</b>\n<i>Обновлено в <b>${currentTime}</b></i>`;
    // если результат является двумерным массивом, а не текстовым статусом
    if (typeof resultObject !== `string`) {
      for (
        let time_option = 0;
        time_option < resultObject.length;
        time_option++
      ) {
        let currentHour = (end_time - time_option).toString();
        let currentTimeInfo = ``;
        currentTimeInfo += `\n\n`;
        currentTimeInfo += texts.numbers[currentHour[0]];
        currentTimeInfo += texts.numbers[currentHour[1]];
        currentTimeInfo += `<b>╏</b>0️⃣0️⃣\n`;

        if (resultObject[time_option].length > 0) {
          for (
            let game_option = 0;
            game_option < resultObject[time_option].length;
            game_option++
          ) {
            let game = resultObject[time_option][game_option];
            if (game.name.includes("(")) {
              game.name = game.name.slice(0, game.name.indexOf(`(`) - 1);
            }
            currentTimeInfo += texts.games[game.name];
            currentTimeInfo += `  `;
            currentTimeInfo += game.name;
            currentTimeInfo += `  <code>[голосов: ${game.current_players.length}]</code>`;

            if (game_option + 1 !== resultObject[time_option].length) {
              currentTimeInfo += `\n`;
            }
          }
          normalResult += currentTimeInfo;
        }
        if (resultObject[time_option].length === 0) {
          let choosenTime = (await player_timeAPI.get(player_id)).data;
          choosenTime = choosenTime.map((time) => time.time);
          if (choosenTime.includes(end_time - time_option)) {
            currentTimeInfo += `<pre>Недостаточно игроков</pre>`;
            normalResult += currentTimeInfo;
          }
        }
      }

      return normalResult;
    }
    // если результат является текстовым статусом, а не двумерным массивом
    if (typeof resultObject === `string`) {
      normalResult += `\n\n`;
      if (resultObject === `not_enough_players`) {
        normalResult += texts.not_enough_players;
      }
      if (resultObject === `no_time_left`) {
        normalResult += texts.no_time_left;
      }
      if (resultObject === `cant_play`) {
        normalResult += texts.cant_play;
      }
      if (resultObject === `incorrectly_filled_by_user`) {
        normalResult += texts.incorrectly_filled_by_user;
      }
      return normalResult;
    }
  }
  if (fullResult) {
    normalResult += `<b>ОБЩЕЕ РАСПИСАНИЕ</b>\n<i>Обновлено в <b>${currentTime}</b></i>`;
    for (
      let time_option = 0;
      time_option < resultObject.length;
      time_option++
    ) {
      let currentHour = (end_time - time_option).toString();
      normalResult += `\n\n`;
      normalResult += texts.numbers[currentHour[0]];
      normalResult += texts.numbers[currentHour[1]];
      normalResult += `<b>╏</b>0️⃣0️⃣\n`;

      if (resultObject[time_option].length > 0) {
        for (
          let game_option = 0;
          game_option < resultObject[time_option].length;
          game_option++
        ) {
          let game = resultObject[time_option][game_option];
          if (game.name.includes("(")) {
            game.name = game.name.slice(0, game.name.indexOf(`(`) - 1);
          }
          normalResult += texts.games[game.name];
          normalResult += `  `;
          normalResult += game.name;
          normalResult += `  <code>[голосов: ${game.current_players.length}]</code>`;
          if (game_option + 1 !== resultObject[time_option].length) {
            normalResult += `\n`;
          }
        }
      }
      if (resultObject[time_option].length === 0) {
        normalResult += `<pre>Недостаточно игроков</pre>`;
      }
    }
    return normalResult;
  }
};

const createTimeOptions = async function (forPoll = false) {
  const currentDate = new Date();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let hh_mm =
    ("0" + currentDate.getHours().toString()).slice(-2) +
    ":" +
    ("0" + currentDate.getMinutes().toString()).slice(-2);

  let time_options = [];
  for (let option = end_time; time_options.length < 10; option--) {
    if (hours !== option) {
      time_options.push(option.toString() + `:00`);
    }
    if (hours === option) {
      if (!forPoll) {
        if (minutes <= 55) {
          time_options.push(option.toString() + `:00`);
          break;
        }
      }
      if (forPoll) {
        if (minutes <= 30) {
          time_options.push(`${hh_mm} (момент создания опроса)`);
          break;
        }
      }
      break;
    }
  }
  return time_options;
};

const updateAllResultMessages = async function () {
  const fullResult = await createFilledResult();
  const normalFullResult = await setResultToNormal(fullResult, true);
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const leftMinutes = 60 - currentMinutes;
  const players_with_results = (await player_voteAPI.getAll()).data;
  for (
    let player_order = 0;
    player_order < players_with_results.length;
    player_order++
  ) {
    let player_info = players_with_results[player_order];
    let player_settings = (await player_settingsAPI.get(player_info.player_id))
      .data;
    try {
      // обновление и уведомление по Общему расписанию
      if (player_settings[1].enabled) {
        if (player_settings[1].before_reminder === -1) {
          await editMessage(
            player_info.player_id,
            normalFullResult,
            player_info.full_result_message_id
          );
        } else {
          let time_check_id = end_time - currentHour - 1;
          // если нет игр в ближайший час
          if (fullResult[time_check_id].length === 0) {
            await editMessage(
              player_info.player_id,
              normalFullResult,
              player_info.full_result_message_id
            );
          } else {
            if (leftMinutes !== player_settings[1].before_reminder) {
              await editMessage(
                player_info.player_id,
                normalFullResult,
                player_info.full_result_message_id
              );
            } else {
              await deleteMessage(
                player_info.player_id,
                player_info.full_result_message_id
              );
              let sentFullResult = await sendMessage(
                player_info.player_id,
                normalFullResult
              );
              await player_voteAPI.update(player_info.player_id, {
                full_result_message_id: sentFullResult,
              });
            }
          }
        }
      }

      // обновление и уведомление по Персональному расписанию
      if (player_settings[0].enabled) {
        let personalResult = await createPersonalResult(
          player_info.player_id,
          fullResult
        );
        let normalPersonalResult = await setResultToNormal(
          personalResult,
          false,
          player_info.player_id
        );

        // если Персональное расписание является пустым, то оно передаёт строку, а не массив, потому только обновить
        if (typeof personalResult === `string`) {
          await editMessage(
            player_info.player_id,
            normalPersonalResult,
            player_info.personal_result_message_id
          );
        } else {
          if (player_settings[0].before_reminder === -1) {
            await editMessage(
              player_info.player_id,
              normalPersonalResult,
              player_info.personal_result_message_id
            );
          } else {
            let time_check_id = end_time - currentHour - 1;
            // если нет игр в ближайший час
            if (personalResult[time_check_id].length === 0) {
              await editMessage(
                player_info.player_id,
                normalPersonalResult,
                player_info.personal_result_message_id
              );
            } else {
              if (leftMinutes !== player_settings[0].before_reminder) {
                await editMessage(
                  player_info.player_id,
                  normalPersonalResult,
                  player_info.personal_result_message_id
                );
              } else {
                await deleteMessage(
                  player_info.player_id,
                  player_info.personal_result_message_id
                );
                let sentPersonalResult = await sendMessage(
                  player_info.player_id,
                  normalPersonalResult
                );
                await player_voteAPI.update(player_info.player_id, {
                  personal_result_message_id: sentPersonalResult,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      await sendMessage(
        admin,
        `При обновлении расписаний произошла ошибка, детали выведены в консоль`
      );
      console.log(error);
    }
  }
};

const sendAllResultMessages = async function (player_id, player_vote) {
  const playerSettings = (await player_settingsAPI.get(player_id)).data;
  const personalResultSettings = playerSettings[0];
  const fullResultSettings = playerSettings[1];
  const fullResult = await createFilledResult();

  if (!player_vote) {
    player_vote = (await player_voteAPI.get(player_id)).data;
  }

  if (fullResultSettings.enabled) {
    if (player_vote.full_result_message_id === null) {
      const normalFullResult = await setResultToNormal(fullResult, true);
      const messageFullResult = await sendMessage(player_id, normalFullResult);

      await player_voteAPI.update(player_id, {
        full_result_message_id: messageFullResult,
      });
    }
  }

  if (personalResultSettings.enabled) {
    if (player_vote.personal_result_message_id === null) {
      const personalResult = await createPersonalResult(player_id, fullResult);
      const normalPersonalResult = await setResultToNormal(
        personalResult,
        false,
        player_id
      );
      const messagePersonalResult = await sendMessage(
        player_id,
        normalPersonalResult
      );

      await player_voteAPI.update(player_id, {
        personal_result_message_id: messagePersonalResult,
      });
    }
  }
};

const answerProcessing = async function (ctx) {
  const player = ctx.update.poll_answer.user.id;
  const poll_id = ctx.update.poll_answer.poll_id;
  const options = ctx.update.poll_answer.option_ids;
  const activePolls = (await pollsAPI.getAll()).data;
  const player_vote = (await player_voteAPI.get(player)).data;

  // первый опрос (готовность)
  if (poll_id === activePolls[0].poll_id) {
    if (options.length === 0) {
      return await player_voteAPI.update(player, { ready_to_play: false });
    }

    if (options[0] === 1) {
      await sendMessage(player, texts.cantToday);
      return await player_voteAPI.update(player, { ready_to_play: false });
    }

    if (options[0] === 0) {
      if (player_vote.polls_sent > 1) {
        return await player_voteAPI.update(player, { ready_to_play: true });
      } else {
        await forwardMessage(player, activePolls[1].message_id);
        return await player_voteAPI.update(player, {
          polls_sent: 2,
          ready_to_play: true,
        });
      }
    }
  }
  // второй опрос (игры)
  if (poll_id === activePolls[1].poll_id) {
    if (options.length === 0) {
      return await player_gameAPI.delete(player);
    }

    if (options.length > 0) {
      if (player_vote.filled_all_polls || player_vote.polls_sent === 3) {
        return await player_gameAPI.create(player, options);
      } else {
        if (activePolls[2].poll_id) {
          await forwardMessage(player, activePolls[2].message_id);
          await player_voteAPI.update(player, { polls_sent: 3 });
          return await player_gameAPI.create(player, options);
        } else {
          await player_voteAPI.update(player, { filled_all_polls: true });
          return await player_gameAPI.create(player, options);
        }
      }
    }
  }
  // третий опрос (время)
  if (poll_id === activePolls[2].poll_id) {
    if (options.length === 0) {
      return await player_timeAPI.delete(player);
    }

    if (options.length > 0) {
      if (!player_vote.filled_all_polls) {
        await player_voteAPI.update(player, { filled_all_polls: true });
        await player_timeAPI.create(player, options);
        return await sendAllResultMessages(player);
      }
      if (player_vote.filled_all_polls) {
        return await player_timeAPI.create(player, options);
      }
    }
  }
};

const privateStatus = async function (ctx) {
  const user_id = ctx.update.my_chat_member.chat.id;
  const status = ctx.update.my_chat_member.new_chat_member.status;

  if (status === "kicked") {
    await playersAPI.update(user_id, false);
  }
  if (status === "member") {
    const created_at = Date.parse(
      (await playersAPI.get(user_id)).data.was_created
    );
    const dataComparsion = (new Date() - created_at) / 1000 / 60;
    // если с момента создания прошло больше 30 минут (привели время выше к минутам)
    if (dataComparsion > 30) {
      await playersAPI.update(user_id, true);
      const result = await ctx.reply(texts.welcomeBack, buttons.groupInvitation);
    }
    // если пользователь разблокировал бота, но опросы сегодня ему ещё не были отправлены
    const player_vote = (await player_voteAPI.get(user_id)).data;
    if (!player_vote) {
      await addToMailing(user_id);
    }
  }
};

const groupStatus = async function (ctx, status) {
  if (status) {
    const user = ctx.update.message.new_chat_member.id;
  }
  if (!status) {
    const user = ctx.update.message.left_chat_participant.id;
  }
};

//#endregion

//#region liveCatch

bot.start(async (ctx) => getStarted(ctx));
bot.on("my_chat_member", async (ctx) => await privateStatus(ctx));
bot.on("new_chat_members", async (ctx) => await groupStatus(ctx, true));
bot.on("left_chat_member", async (ctx) => await groupStatus(ctx, false));
bot.on("poll_answer", async (ctx) => await answerProcessing(ctx));

bot.action("delete", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (error) {
    ctx.reply(texts.too_old);
  }
});

bot.command("assemble", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    const polls = (await pollsAPI.getAll()).data;
    const sender = ctx.update.message.from;

    if (polls[0].message_id) {
      await sendMessage(sender.id, texts.alreadyActive);
      return await ctx.deleteMessage();
    } else {
      await beforeMailing(sender);
      return await ctx.deleteMessage();
    }
  }
  await sendMessage(player_id, texts.sorry);
});

bot.command("invite", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    await sendMessage(player_id, texts.invitation[0]);
    await sendMessage(player_id, texts.invitation[1]);
    await sendMessage(player_id, texts.invitation[2]);
    await sendMessage(player_id, `<code>${player_id}</code>`);
    return await ctx.deleteMessage();
  }
  await sendMessage(player_id, texts.sorry);
});

bot.command("group", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    await ctx.replyWithHTML(texts.group, buttons.groupInvitation);
    return await ctx.deleteMessage();
  }
  await sendMessage(player_id, texts.sorry);
});

bot.command("settings", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    await ctx.replyWithHTML(
      texts.forButtonPersonalReminder,
      await settingsButtons(ctx, true)
    );
    return await ctx.deleteMessage();
  }
  await sendMessage(player_id, texts.sorry);
});

bot.command("about", async (ctx) => {
  await ctx.replyWithHTML(texts.about);
  return await ctx.deleteMessage();
});

// обработка нажатий в настройках
bot.action(personalActions, async (ctx) => await actionProcessing(ctx));
bot.action(fullActions, async (ctx) => await actionProcessing(ctx));

// обработка Любого текста, если предыдущие условия не сработали
bot.on("text", async (ctx) => textProcessing(ctx));

//#endregion

//#region Launch Servers

//DB Launch
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

const dbServer = function () {
  try {
    app.listen(PORT, console.log(`Server DB is started on port ${PORT}`));
  } catch (error) {
    console.log(error);
    console.log("DB could not start, all Error at the Top");
  }
};
dbServer();

// проверка, есть ли активные опросы (при перезапуске программы). Если да, то возобновить обновление расписания
setTimeout(async () => {
  const mainPollData = (await pollsAPI.get(1)).data.message_id;
  if (mainPollData) {
    return await enableResultUpdates();
  }
}, 1500);

//Bot launch
try {
  bot.launch();
  console.log("Server Bot is started");
} catch (error) {
  console.log(error);
  console.log("Bot could not start, all Error at the Top");
}

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//#endregion

//#region DevRegion

const devFun = async function () {
  setTimeout(async () => {
    //await sendMessage(admin, 123, buttons.deleteThisMessage)
    //await stopPolls()
    //!!!ниже рассылка по !Всем активным пользователям
    //((await playersAPI.getAll(true)).data).forEach(user => sendMessage(user.id, texts.forAllInfoMessage));
  }, 500);
};
devFun();

//#endregion
