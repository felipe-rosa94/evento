const express = require('express')
const router = express.Router()
const controller = require('../controllers/db-controller')

router.get('/:collection', controller.get)

router.post('/:collection', controller.post)

router.put('/:collection', controller.put)

router.delete('/:collection', controller.delete)

module.exports = router