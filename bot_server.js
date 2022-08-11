const { Telegraf, Markup } = require("telegraf");
const { bot_token } = require("dotenv").config().parsed;

const bot = new Telegraf(bot_token);
