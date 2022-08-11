const Router = require("express");
const router_players = new Router();
const playersController = require("./players.controller");

router_players.get("/players?", playersController.getAllPlayers);
router_players.get("/players/:id", playersController.getPlayer);
router_players.put("/players/:id", playersController.updatePlayer);
router_players.post("/players", playersController.createPlayer);

module.exports = router_players;
