const Router = require("express");
const router_player_vote = new Router();
const player_voteController = require("./player_vote.controller");

router_player_vote.get("/player_vote", player_voteController.getAllPlayer_vote);
router_player_vote.get(
  "/player_vote/:id",
  player_voteController.getPlayer_vote
);
router_player_vote.put(
  "/player_vote/:id",
  player_voteController.updatePlayer_vote
);
router_player_vote.post(
  "/player_vote",
  player_voteController.createPlayer_vote
);
router_player_vote.delete(
  "/player_vote",
  player_voteController.deleteAllPlayer_vote
);

module.exports = router_player_vote;
