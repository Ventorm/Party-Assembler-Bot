const Router = require('express')
const router_games = new Router()
const gamesController = require('./games.controller')


router_games.get('/games', gamesController.getAllGames)
router_games.get('/games/:id', gamesController.getGame)


module.exports = router_games