const Router = require('express')
const router_player_game = new Router()
const player_gameController = require('./player_game.controller')


router_player_game.get('/player_game', player_gameController.getAllPlayer_game)
router_player_game.post('/player_game', player_gameController.createPlayer_game)
router_player_game.delete('/player_game/:id', player_gameController.deletePlayer_game)
router_player_game.delete('/player_game', player_gameController.deleteAllPlayer_game)


module.exports = router_player_game
