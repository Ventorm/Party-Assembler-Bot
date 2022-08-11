const { default: axios } = require("axios");
const { bot_token, twinkByAdmin } = require("dotenv").config().parsed;

class Messages {
  async send(chat_id, content, pinnedButtons = false, parse_mode = "HTML") {
    const method = "sendMessage";
    const type = "text";
    content = encodeURIComponent(content);
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&${type}=${content}&parse_mode=${parse_mode}`;

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
  }

  async edit(
    chat_id,
    newText = "",
    message_id,
    pinnedButtons = false,
    parse_mode = "HTML"
  ) {
    const method = "editMessageText";
    newText = encodeURIComponent(newText);
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}&text=${newText}&parse_mode=${parse_mode}`;

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
  }

  async forward(chat_id, message_id, method = "forwardMessage") {
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&from_chat_id=${twinkByAdmin}&message_id=${message_id}`;

    try {
      const result = (await axios.post(url)).data.result.message_id;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }

  async delete(chat_id, message_id, method = "deleteMessage") {
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;

    try {
      const result = (await axios.post(url)).data;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }

  async pin(
    chat_id,
    message_id,
    disable_notification = true,
    method = "pinChatMessage"
  ) {
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}&disable_notification=${disable_notification}`;
    try {
      const result = (await axios.post(url)).data;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }

  async unpin(chat_id, message_id, method = "unpinChatMessage") {
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;
    try {
      const result = (await axios.post(url)).data;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }
}

module.exports = new Messages();
