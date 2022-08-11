const { Telegraf } = require("telegraf");
const { bot_token } = require("dotenv").config().parsed;
const { playersAPI, pollsAPI } = require("../DB/db_API");
const { texts } = require("./texts");
const { beforeMailing } = require("./mailing.js")
const Messages = require("../components/Messages.js");
const Polls = require("../components/Polls");

const {
  buttons,
  actionProcessing,
  settingsButtons,
  personalActions,
  fullActions,
} = require("./buttons");

const {
  getStarted,
  textProcessing,
  answerProcessing,
  privateStatus,
  groupStatus,
} = require("./functions");



const bot = new Telegraf(bot_token);

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
      await Messages.send(sender.id, texts.alreadyActive);
      return await ctx.deleteMessage();
    } else {
      await beforeMailing(sender);
      return await ctx.deleteMessage();
    }
  }
  await Messages.send(player_id, texts.sorry);
});

bot.command("invite", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    await Messages.send(player_id, texts.invitation[0]);
    await Messages.send(player_id, texts.invitation[1]);
    await Messages.send(player_id, texts.invitation[2]);
    await Messages.send(player_id, `<code>${player_id}</code>`);
    return await ctx.deleteMessage();
  }
  await Messages.send(player_id, texts.sorry);
});

bot.command("group", async (ctx) => {
  const player_id = ctx.message.from.id.toString();
  const created = (await playersAPI.get(player_id)).data;
  if (created) {
    await ctx.replyWithHTML(texts.group, buttons.groupInvitation);
    return await ctx.deleteMessage();
  }
  await Messages.send(player_id, texts.sorry);
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
  await Messages.send(player_id, texts.sorry);
});

bot.command("about", async (ctx) => {
  await ctx.replyWithHTML(texts.about);
  return await ctx.deleteMessage();
});

// обработка нажатий на кнопки, на данный момент только в настройках
bot.action(personalActions, async (ctx) => await actionProcessing(ctx));
bot.action(fullActions, async (ctx) => await actionProcessing(ctx));

// обработка Любого текста, если предыдущие условия не сработали
bot.on("text", async (ctx) => textProcessing(ctx));

module.exports = { bot };
