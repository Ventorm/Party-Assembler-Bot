const db = require("../db_pool");
const { createDateWithTargetGMT } = require("../../components/Time");
const Messages = require("../../components/Messages")

class PollsController {
  async getAllPolls(req, res) {
    try {
      const polls = await db.query(`select * FROM polls ORDER BY order_id`);

      return res.json(polls.rows);
    } catch (error) {
      return error;
    }
  }

  async getPoll(req, res) {
    const order_id = req.params.id;
    try {
      const polls = await db.query(
        `select (message_id) FROM polls where order_id = ${order_id}`
      );

      return res.json(polls.rows[0]);
    } catch (error) {
      return error;
    }
  }

  async updateAllPolls(req, res) {
    try {
      const polls = await db.query(
        `update polls SET poll_id = null, message_id = null`
      );

      return res.json(polls.rows);
    } catch (error) {
      return error;
    }
  }

  async updatePoll(req, res) {
    const order_id = req.params.id;
    const { poll_id, message_id } = req.body;

    const today = createDateWithTargetGMT();
    const year = today.getFullYear();
    // месяц берётся от 0 до 11, для удобства далем +1
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const todayTimestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    try {
      const polls = await db.query(
        `update polls SET poll_id = ${poll_id}, message_id = ${message_id}, was_created = '${todayTimestamp}' WHERE order_id = ${order_id}`
      );

      return res.json(polls.rows[0]);
    } catch (error) {
      return error;
    }
  }
}

module.exports = new PollsController();
