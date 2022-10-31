const { default: axios } = require("axios");
const { bot_token, twinkByAdmin } = require("../config");

class Messages {
  async send(chat_id, text, pinnedButtons = false, parse_mode = "HTML") {
    const method = "sendMessage";
    const type = "text";
    text = encodeURIComponent(text);
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&${type}=${text}&parse_mode=${parse_mode}`;

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

  async sendPhoto(
    chat_id,
    img_url,
    caption = false,
    pinnedButtons = false,
    parse_mode = "HTML"
  ) {
    const method = "sendPhoto";
    const type = "photo";
    img_url = encodeURIComponent(img_url);
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&${type}=${img_url}&parse_mode=${parse_mode}`;

    if (caption) {
      url += `&caption=${encodeURIComponent(caption)}`;
    }

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

  async sendDocument(
    chat_id,
    doc_url,
    caption = false,
    pinnedButtons = false,
    parse_mode = "HTML"
  ) {
    const method = "sendDocument";
    const type = "document";
    // если файл из облака гугла, то преобразовываем его к прямой ссылке на скачивание
    if (doc_url.includes("drive.google.com")) {
      if (!doc_url.includes("download")) {
        let doc_id = doc_url.split("/");
        doc_id = doc_id[doc_id.length - 2];
        doc_url = `https://drive.google.com/uc?export=download&id=`;
        doc_url += doc_id;
      }
    }
    doc_url = encodeURIComponent(doc_url);
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&${type}=${doc_url}&parse_mode=${parse_mode}`;

    if (caption) {
      url += `&caption=${encodeURIComponent(caption)}`;
    }

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

  async forward(chat_id, message_id, from_chat_id = "") {
    const method = "forwardMessage";
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;
    
    if (from_chat_id) {
      url += `&from_chat_id=${from_chat_id}`;
    } else {
      url += `&from_chat_id=${twinkByAdmin}`;
    }

    try {
      const result = (await axios.post(url)).data.result.message_id;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }

  async copy_send(chat_id, message_id, from_chat_id = "", caption = false) {
    const method = "copyMessage";
    let url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&message_id=${message_id}`;

    if (from_chat_id) {
      url += `&from_chat_id=${from_chat_id}`;
    } else {
      url += `from_chat_id=${twinkByAdmin}`;
    }

    if (caption) {
      url += `&caption=${encodeURIComponent(caption)}`;
    }

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
