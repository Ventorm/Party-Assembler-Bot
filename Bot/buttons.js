const { Markup } = require(`telegraf`);
const { player_settingsAPI, player_voteAPI } = require("../DB/db_API.js");
const { sendAllResultMessages } = require("./mailing.js");
const {
  admin,
  adminUserName,
  twinkByAdmin,
  adminHelper,
} = require("../config");
const { texts } = require("./texts");
const Messages = require("../components/Messages.js");
const Polls = require("../components/Polls.js");

const buttons = {
  /*
  temporaryStopNotifications: Markup.inlineKeyboard([
    [
      Markup.button.url(
        `Не уведомлять сегодня`,
        `https://t.me/+AoRKG2Wb3_Y2MTBi`
      ),
    ],
  ]),
  test: Markup.inlineKeyboard([
    [Markup.button.url(`Hello there`, `https://t.me/+AoRKG2Wb3_Y2MTBi`)],
  ]),
  */
  deleteThisMessage: Markup.inlineKeyboard([
    [Markup.button.callback(`Скрыть сообщение  🗑`, `delete`)],
  ]),
  aboutInfo: Markup.inlineKeyboard([
    [Markup.button.callback(`Как тут всё устроено?  🔬`, `about`)],
  ]),
  adminLink: Markup.inlineKeyboard([
    [
      Markup.button.url(
        `Написать разработчику  🔧`,
        `https://t.me/${adminUserName}`
      ),
    ],
  ]),
  groupInvitation: Markup.inlineKeyboard([
    [
      Markup.button.url(
        `👉 Перейти в группу 👈`,
        `https://t.me/+AoRKG2Wb3_Y2MTBi`
      ),
    ],
  ]),
  disablePersonalResult: [
    Markup.button.callback(
      `🚫 Не показывать Персональное расписание 🚫`,
      `disablePersonalResult`
    ),
  ],
  enablePersonalResult: [
    Markup.button.callback(
      `📣 Показывать Персональное расписание 📣`,
      `enablePersonalResult`
    ),
  ],
  disableFullResult: [
    Markup.button.callback(
      `🚫 Не показывать Общее расписание 🚫`,
      `disableFullResult`
    ),
  ],
  enableFullResult: [
    Markup.button.callback(
      `📣 Показывать Общее расписание 📣`,
      `enableFullResult`
    ),
  ],
};

const settingsButtons = async function (ctx, personal = true, updatedData) {
  let player_id;
  if (!personal || ctx.update.callback_query) {
    player_id = ctx.update.callback_query.from.id;
  } else {
    player_id = ctx.update.message.from.id;
  }

  let currentSettings;
  if (updatedData) {
    currentSettings = updatedData;
  }

  if (!updatedData) {
    if (personal) {
      currentSettings = (await player_settingsAPI.get(player_id)).data[0];
    } else {
      currentSettings = (await player_settingsAPI.get(player_id)).data[1];
    }
  }

  let mark1 = "",
    mark2 = "",
    mark3 = "",
    mark4 = "",
    mark5 = "";
  switch (currentSettings.before_reminder) {
    case 45:
      mark1 = "🟢";
      break;
    case 30:
      mark2 = "🟢";
      break;
    case 15:
      mark3 = "🟢";
      break;
    case 5:
      mark4 = "🟢";
      break;
    case -1:
      mark5 = "🟢";
      break;
  }

  let show_settings = {
    notification_text: ``,
    notification_command: ``,
    other_schedule_text: ``,
    other_schedule_command: ``,
    enable_disable_switch: ``,
  };
  if (personal) {
    show_settings.notification_text = `Персональные уведомления`;
    show_settings.notification_command = `personal`;
    show_settings.other_schedule_text = `👉 Настроить Общее расписание 👈`;
    show_settings.other_schedule_command = "showFullSettings";
    if (currentSettings.enabled) {
      show_settings.enable_disable_switch = buttons.disablePersonalResult;
    }
    if (!currentSettings.enabled) {
      show_settings.enable_disable_switch = buttons.enablePersonalResult;
    }
  }
  if (!personal) {
    show_settings.notification_text = `Общие уведомления`;
    show_settings.notification_command = `full`;
    show_settings.other_schedule_text = `👉 Настроить Персональное расписание 👈`;
    show_settings.other_schedule_command = "showPersonalSettings";
    if (currentSettings.enabled) {
      show_settings.enable_disable_switch = buttons.disableFullResult;
    }
    if (!currentSettings.enabled) {
      show_settings.enable_disable_switch = buttons.enableFullResult;
    }
  }

  let createdButtons = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `45 минут ${mark1}`,
        `${show_settings.notification_command}_45`
      ),
      Markup.button.callback(
        `30 минут ${mark2}`,
        `${show_settings.notification_command}_30`
      ),
    ],
    [
      Markup.button.callback(
        `15 минут ${mark3}`,
        `${show_settings.notification_command}_15`
      ),
      Markup.button.callback(
        `5 минут ${mark4}`,
        `${show_settings.notification_command}_5`
      ),
    ],
    [
      Markup.button.callback(
        `Отключить ${show_settings.notification_text} ${mark5}`,
        `${show_settings.notification_command}_-1`
      ),
    ],
    show_settings.enable_disable_switch,
    [
      Markup.button.callback(
        show_settings.other_schedule_text,
        show_settings.other_schedule_command
      ),
    ],
    [Markup.button.callback("Скрыть окно настроек", "delete")],
  ]);

  return createdButtons;
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
            await Messages.delete(
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
            await Messages.delete(
              player_id,
              player_vote.full_result_message_id
            );
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

const personalActions = [
  `disablePersonalResult`,
  `enablePersonalResult`,
  `personal_45`,
  `personal_30`,
  `personal_15`,
  `personal_5`,
  `personal_-1`,
  `showFullSettings`,
];

const fullActions = [
  `disableFullResult`,
  `enableFullResult`,
  `full_45`,
  `full_30`,
  `full_15`,
  `full_5`,
  `full_-1`,
  `showPersonalSettings`,
];

module.exports = {
  buttons,
  actionProcessing,
  settingsButtons,
  personalActions,
  fullActions,
};
