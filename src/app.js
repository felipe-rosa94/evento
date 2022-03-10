const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({origin: '*'}))
app.use(express.json({limit: '50mb', type: ['application/json', 'text/plain']}))

const db = require('./routes/db-route')
app.use('/evento/db', db)

const free = require('./routes/free-route')
app.use('/evento/free', free)

const mail = require('./routes/mail-route')
app.use('/evento/mail', mail)

const image = require('./routes/image-route')
app.use('/evento/image', image)

const backup = require('./routes/backup-route')
app.use('/evento/backup', backup)

module.exports = app