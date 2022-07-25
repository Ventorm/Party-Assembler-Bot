const Router = require("express");
const router_polls = new Router();
const pollsController = require("./polls.controller");

router_polls.get("/polls", pollsController.getAllPolls);
router_polls.get("/polls/:id", pollsController.getPoll);
router_polls.put("/polls", pollsController.updateAllPolls);
router_polls.put("/polls/:id", pollsController.updatePoll);

module.exports = router_polls;
