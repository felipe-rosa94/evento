const express = require('express')
const router = express.Router()
const controller = require('../controllers/free-controller')

router.get('/', controller.get)

router.post('/:funcao', controller.post)

router.put('/', controller.put)

router.delete('/', controller.delete)

module.exports = router
