const express = require('express')
const router = express.Router()
const controller = require('../controllers/backup-controller')
router.post('/', controller.post)
router.put('/', controller.put)
module.exports = router