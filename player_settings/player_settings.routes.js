const Router = require('express')
const router_player_settings = new Router()
const player_settingsController = require('./player_settings.controller')


router_player_settings.get('/player_settings?', player_settingsController.getAllPlayer_settings)
router_player_settings.get('/player_settings/:id?', player_settingsController.getPlayer)
router_player_settings.put('/player_settings/:id', player_settingsController.updatePlayer)
router_player_settings.post('/player_settings', player_settingsController.createPlayer)


module.exports = router_player_settings
