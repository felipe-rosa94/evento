const express = require('express')
const router = express.Router()
const controller = require('../controllers/mail-controller')

router.post('/', controller.post)

module.exports = router
