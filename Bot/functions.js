const Messages = require("../components/Messages.js");
const Polls = require("../components/Polls.js");
const { admin } = require("dotenv").config().parsed;
const { texts } = require("./texts");
const { buttons } = require("./buttons");
const { sendAllResultMessages } = require("./mailing");

const {
  playersAPI,
  pollsAPI,
  player_timeAPI,
  player_gameAPI,
  player_voteAPI,
  player_settingsAPI,
} = require("../DB/db_API");

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
          await Messages.send(sender.id, texts.allowed);
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
      await Messages.send(player, texts.cantToday, buttons.deleteThisMessage);
      return await player_voteAPI.update(player, { ready_to_play: false });
    }

    if (options[0] === 0) {
      if (player_vote.polls_sent > 1) {
        return await player_voteAPI.update(player, { ready_to_play: true });
      } else {
        await Messages.forward(player, activePolls[1].message_id);
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
          await Messages.forward(player, activePolls[2].message_id);
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
      const result = await ctx.reply(
        texts.welcomeBack,
        buttons.groupInvitation
      );
    }
    // если пользователь разблокировал бота, но опросы сегодня ему ещё не были отправлены
    const player_vote = (await player_voteAPI.get(user_id)).data;
    if (!player_vote) {
      await addToMailing(user_id);
    }
  }
};

// оставлено на будущее, пока не функционирует
const groupStatus = async function (ctx, status) {
  if (status) {
    const user = ctx.update.message.new_chat_member.id;
  }
  if (!status) {
    const user = ctx.update.message.left_chat_participant.id;
  }
};

module.exports = {
  getStarted,
  textProcessing,
  answerProcessing,
  privateStatus,
  groupStatus,
};
