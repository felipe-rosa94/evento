require('dotenv').config()
require('../src/auth')
const app = require('../src/app')
const http = require('http')
const httpServer = http.createServer(app)
httpServer.listen(process.env.PORTA)
console.log('API Eventos')