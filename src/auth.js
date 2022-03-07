const firebase = require('../src/firebase')

firebase
    .auth()
    .signInWithEmailAndPassword('consumocontrole@gmail.com', 'bHnLH6lSdv4p')
    .then(r => console.log('Autenticado'))
    .catch(error => console.error(error + 'Erro ao autentitar'))

module.exports = firebase