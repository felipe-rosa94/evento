require('dotenv').config()
const admin = require('../admin')
const db = admin.firestore()
const crypto = require('crypto')
const moment = require('moment')

exports.get = ('/:collection', (req, res) => {
    if (isEmpty(req.query))
        buscaTodos(req, res)
    else
        buscaEspecifico(req, res)
})

exports.post = ('/:collection', (req, res) => {
    criaRegistro(req, res)
})

exports.put = ('/:collection', (req, res) => {
    alterarRegistro(req, res)
})

exports.delete = ('/:collection', (req, res) => {
    deletaRegistro(req, res)
})

const buscaTodos = (req, res) => {
    try {
        const {params: {collection}, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1 && token !== process.env.TOKEN_2) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection(collection)
            .where('token', '==', tokenid)
            .get()
            .then(doc => {
                let array = []
                doc.forEach(i => array.push(i.data()))
                res.status(200).send({sucesso: true, status: 'ok', codigo: 1, dados: array})
            })
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const buscaEspecifico = (req, res) => {
    try {
        const {params: {collection}, headers: {token, tokenid}, query} = req
        const {campo, valor, operador} = JSON.parse(query.q)
        if (token !== process.env.TOKEN_1 && token !== process.env.TOKEN_2) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection(collection)
            .where('token', '==', tokenid)
            .where(campo, (((operador !== '') && (operador !== undefined)) ? operador : '=='), valor)
            .get()
            .then(doc => {
                const array = []
                doc.forEach(i => array.push(i.data()))
                res.status(200).send({sucesso: true, status: 'ok', codigo: 1, dados: array})
            })
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const criaRegistro = (req, res) => {
    try {
        const {body, params: {collection}, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        body.token = tokenid
        body.id = geraID()

        db.collection(collection)
            .doc(body.id)
            .set(body)
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1, id: body.id}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        try {
            db.collection('ibini')
                .doc(collection)
                .set({[tokenid]: {token: tokenid, data: moment().format('DD-MM-YYYY HH:mm:ss')}})
                .then(r => console.log(r))
        } catch (e) {

        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const alterarRegistro = (req, res) => {
    try {
        const {body, params: {collection}, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection(collection)
            .doc(body.id)
            .update(body)
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        try {
            db.collection('ibini')
                .doc(collection)
                .set({[tokenid]: {token: tokenid, data: moment().format('DD-MM-YYYY HH:mm:ss')}})
                .then(r => console.log(r))
        } catch (e) {

        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const deletaRegistro = (req, res) => {
    try {
        const {params: {collection}, headers: {token, tokenid, id}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection(collection)
            .doc(id)
            .delete()
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        try {
            db.collection('ibini')
                .doc(collection)
                .set({[tokenid]: {token: tokenid, data: moment().format('DD-MM-YYYY HH:mm:ss')}})
                .then(r => console.log(r))
        } catch (e) {

        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const isEmpty = obj => {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true
}

const geraID = () => {
    let wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let s = Array.from(crypto.randomFillSync(new Uint8Array(10))).map((x) => wishlist[x % wishlist.length]).join('')
    return `${s}${Math.floor(Math.random() * 999)}`
}

