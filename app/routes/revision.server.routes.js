var express = require('express')
var controller = require('../controllers/revision.server.controller')
var router = express.Router()
router.get('/', controller.home) 
router.get('/overviewdata', controller.showOverview)
router.get('/articledata', controller.indipage)
module.exports= router