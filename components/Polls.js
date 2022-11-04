const {
  pollsAPI,
  player_gameAPI,
  player_voteAPI,
  player_timeAPI,
} = require("../DB/db_API");
const { default: axios } = require("axios");
const { bot_token, twinkByAdmin } = require("../config");
const Messages = require("./Messages");

class Polls {
  async send(
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
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&question=${question}&options=${options}&is_anonymous=${anonymous}&allows_multiple_answers=${multiple_answers}&type=${type}`;

    try {
      const result = (await axios.post(url)).data.result;
      return result;
    } catch (error) {
      console.log(error.response.data.description);
    }
  }

  async stopAllPolls() {
    const method = "stopPoll";
    const polls = (await pollsAPI.getAll()).data;
    // остановка опросов
    polls.forEach(async (poll) => {
      if (poll.message_id) {
        const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${twinkByAdmin}&message_id=${poll.message_id}`;
        try {
          const result = (await axios.get(url)).data.result;
        } catch (error) {
          console.log(error.response.data.description);
        }
      }
    });
    // удаление расписаний
    const usersWithResults = (await player_voteAPI.getAll()).data;
    usersWithResults.forEach(async (user) => {
      if (user.full_result_message_id) {
        await Messages.delete(user.player_id, user.full_result_message_id);
      }
      if (user.personal_result_message_id) {
        await Messages.delete(user.player_id, user.personal_result_message_id);
      }
    });
    // очистка данных за последний день
    await player_voteAPI.deleteAll();
    await player_gameAPI.deleteAll();
    await player_timeAPI.deleteAll();
    return await pollsAPI.updateAll();
  }

  async sendQuiz(
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
    const url = `https://api.telegram.org/bot${bot_token}/${method}?chat_id=${chat_id}&question=${question}&options=${options}&is_anonymous=${anonymous}&type=${type}&correct_option_id=${correct_option_id}&explanation=${explanation}`;

    const result = (await axios.post(url)).data.result.message_id;
  }
}

module.exports = new Polls();
