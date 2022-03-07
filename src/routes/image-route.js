const express = require('express')
const router = express.Router()
const controller = require('../controllers/image-controller')

router.put('/', controller.put)

module.exports = router