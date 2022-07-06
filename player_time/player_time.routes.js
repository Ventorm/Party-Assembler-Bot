const Router = require('express')
const router_player_time = new Router()
const player_timeController = require('./player_time.controller')


router_player_time.get('/player_time', player_timeController.getAllPlayer_time)
router_player_time.get('/player_time/:id', player_timeController.getPlayer_time)
router_player_time.post('/player_time', player_timeController.createPlayer_time)
router_player_time.delete('/player_time/:id', player_timeController.deletePlayer_time)
router_player_time.delete('/player_time', player_timeController.deleteAllPlayer_time)


module.exports = router_player_time
