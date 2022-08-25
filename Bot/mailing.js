const {
  gamesAPI,
  pollsAPI,
  playersAPI,
  player_voteAPI,
  player_settingsAPI,
  player_timeAPI,
} = require("../DB/db_API");
const schedule = require("node-schedule");
const end_time = parseInt(require("../config").end_time);
const start_time = parseInt(require("../config").start_time);
//const { createDateFromGMT }
//const MoscowGMT = parseInt(require("../config").MoscowGMT);
const Messages = require("../components/Messages");
const Polls = require("../components/Polls");
const { texts } = require("./texts.js");
const { admin, twinkByAdmin } = require("../config");

const addToMailing = async function (user_id) {
  const polls = (await pollsAPI.getAll()).data;
  if (polls[0].message_id) {
    const player_vote = await (await player_voteAPI.get(user_id)).data;
    if (!player_vote) {
      Messages.send(user_id, texts.justJoined);
      setTimeout(async () => {
        Messages.forward(user_id, polls[0].message_id);
        player_voteAPI.create(user_id);
      }, 3000);
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
      const normalFullResult = await setResultToText(fullResult, true);
      const messageFullResult = await Messages.send(
        player_id,
        normalFullResult
      );

      await player_voteAPI.update(player_id, {
        full_result_message_id: messageFullResult,
      });
    }
  }

  if (personalResultSettings.enabled) {
    if (player_vote.personal_result_message_id === null) {
      const personalResult = await createPersonalResult(player_id, fullResult);
      const normalPersonalResult = await setResultToText(
        personalResult,
        false,
        player_id
      );
      const messagePersonalResult = await Messages.send(
        player_id,
        normalPersonalResult
      );

      await player_voteAPI.update(player_id, {
        personal_result_message_id: messagePersonalResult,
      });
    }
  }
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
        icon: game.icon,
        current_players: [],
        min_players: game.min_players,
        max_players: game.max_players,
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
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
  const currentHour = currentDate.getHours();
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

const setResultToText = async function (
  resultObject,
  fullResult = true,
  player_id
) {
  let normalResult = ``;
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
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
            if (texts.games[game.name] !== game.icon) {
              currentTimeInfo += texts.games[game.name];
              console.log(
                `Данные по иконке из БД берутся некорректно, нужно исправление`
              );
              //await Messages.send(admin, `Данные по иконке из БД берутся некорректно, нужно исправление`);
            } else {
              currentTimeInfo += game.icon;
            }
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
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
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
  const normalFullResult = await setResultToText(fullResult, true);
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
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
          await Messages.edit(
            player_info.player_id,
            normalFullResult,
            player_info.full_result_message_id
          );
        } else {
          let time_check_id = end_time - currentHour - 1;
          // если нет игр в ближайший час
          if (fullResult[time_check_id].length === 0) {
            await Messages.edit(
              player_info.player_id,
              normalFullResult,
              player_info.full_result_message_id
            );
          } else {
            if (leftMinutes !== player_settings[1].before_reminder) {
              await Messages.edit(
                player_info.player_id,
                normalFullResult,
                player_info.full_result_message_id
              );
            } else {
              await Messages.delete(
                player_info.player_id,
                player_info.full_result_message_id
              );
              let sentFullResult = await Messages.send(
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
        let normalPersonalResult = await setResultToText(
          personalResult,
          false,
          player_info.player_id
        );

        // если Персональное расписание является пустым, то оно передаёт строку, а не массив, потому только обновить
        if (typeof personalResult === `string`) {
          await Messages.edit(
            player_info.player_id,
            normalPersonalResult,
            player_info.personal_result_message_id
          );
        } else {
          if (player_settings[0].before_reminder === -1) {
            await Messages.edit(
              player_info.player_id,
              normalPersonalResult,
              player_info.personal_result_message_id
            );
          } else {
            let time_check_id = end_time - currentHour - 1;
            // если нет игр в ближайший час
            if (personalResult[time_check_id].length === 0) {
              await Messages.edit(
                player_info.player_id,
                normalPersonalResult,
                player_info.personal_result_message_id
              );
            } else {
              if (leftMinutes !== player_settings[0].before_reminder) {
                await Messages.edit(
                  player_info.player_id,
                  normalPersonalResult,
                  player_info.personal_result_message_id
                );
              } else {
                await Messages.delete(
                  player_info.player_id,
                  player_info.personal_result_message_id
                );
                let sentPersonalResult = await Messages.send(
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
      await Messages.send(
        admin,
        `При обновлении расписаний произошла ошибка, детали выведены в консоль`
      );
      console.log(error);
    }
  }
};

const pollsCreatedToday = async function () {
  //берём дату создания последнего опроса (игры)
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
  const polls = (await pollsAPI.getAll()).data;
  const was_created = new Date(Date.parse(polls[0].was_created));

  const dayComparsion = currentDate.getDate() - was_created.getDate();
  const monthComparsion = currentDate.getMonth() - was_created.getMonth();

  if (dayComparsion === 0 && monthComparsion === 0) {
    return true;
  }
  return false;
};

const beforeMailing = async function (sender) {
  if (await pollsCreatedToday()) {
    return Messages.send(sender.id, texts.alreadyFinished);
  }

  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + MoscowGMT);
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  if (hours >= end_time) {
    return Messages.send(
      sender.id,
      texts.too_late + "\n\n" + texts.time_for_create
    );
  }
  if (hours < start_time) {
    return Messages.send(
      sender.id,
      texts.too_early + "\n\n" + texts.time_for_create
    );
  }
  return mailing(hours, minutes, sender);
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

  if (sender.id !== parseInt(admin)) {
    if (!sender.username) {
      sender.username = ``;
    }
    if (!sender.first_name) {
      sender.first_name = ``;
    }
    if (!sender.last_name) {
      sender.last_name = ``;
    }
    Messages.send(
      admin,
      `Инициатор опросов:\n<b>${sender.first_name} ${sender.last_name}\n${sender.username}</b>`
    );
  }
};

const mailingFirstPoll = async function (message_id) {
  const players = (await playersAPI.getAll(true)).data;
  players.forEach((player) => {
    if (player.enabled) {
      player_voteAPI.create(player.id);
      Messages.forward(player.id, message_id);
    }
  });
  return "Рассылка завершена (первый опрос)";
};

const createCheckPoll = async function (normal = true) {
  if (normal) {
    const result = await Polls.send(
      twinkByAdmin,
      texts.letsPlay.question,
      texts.letsPlay.answers,
      false
    );
    return result;
  }
  if (!normal) {
    const result = await Polls.send(
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

  const result = await Polls.send(twinkByAdmin, texts.chooseTime, time_options);
  return result;
};

const createGamePoll = async function () {
  const allGames = (await gamesAPI.getAll()).data;
  let games = [];
  allGames.forEach((game) => {
    let game_info = "";
    game_info += game.icon;
    game_info += "  ";
    game_info += game.name;
    games.push(game_info);
  });

  const result = await Polls.send(twinkByAdmin, texts.chooseGame, games);
  return result;
};

const enableResultUpdates = async function () {
  const intervalCheck = schedule.scheduleJob(`*/5 * * * *`, async function () {
    let now = new Date();
    now.setHours(now.getHours() + MoscowGMT);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours === end_time + 1 || (hours === end_time && minutes >= 30)) {
      await Polls.stopAllPolls();
      return await schedule.gracefulShutdown();
    }

    await updateAllResultMessages();
  });
};

module.exports = {
  sendAllResultMessages,
  createEmptyResult,
  createFilledResult,
  createPersonalResult,
  setResultToText,
  createTimeOptions,
  updateAllResultMessages,
  mailingFirstPoll,
  createCheckPoll,
  createTimePoll,
  createGamePoll,
  pollsCreatedToday,
  beforeMailing,
  enableResultUpdates,
  addToMailing,
};
