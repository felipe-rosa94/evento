require('dotenv').config()
const admin = require('../admin')
const db = admin.firestore()
const crypto = require('crypto')
const moment = require("moment")

exports.get = ('/', (req, res) => {
    res.status(200).send({
        title: 'while dev',
        version: '1.0'
    })
})

exports.post = ('/:funcao', (req, res) => {
    if (req.params.funcao === 'login') {
        login(req, res)
    } else if (req.params.funcao === 'cadastro') {
        criaRegistro(req, res)
    } else if (req.params.funcao === 'verificaConta') {
        verificaConta(req, res)
    } else if (req.params.funcao === 'recuperacao') {
        recuperacao(req, res)
    } else if (req.params.funcao === 'alterarSenha') {
        alterarSenha(req, res)
    }
})

exports.put = ('/', (req, res) => {
    alterarRegistro(req, res)
})

exports.delete = ('/', (req, res) => {
    deletaRegistro(req, res)
})

const login = (req, res) => {
    try {
        const {body, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection('free')
            .where('token', '==', tokenid)
            .where('email', '==', body.email)
            .get()
            .then(doc => {
                const array = []
                doc.forEach(i => array.push(i.data()))

                if (array.length === 0) return res.status(200).send({
                    sucesso: false,
                    status: 'E-mail não cadastrado',
                    codigo: 0
                })

                if (array[0].status !== '0') return res.status(200).send({
                    sucesso: false,
                    status: 'Conta ainda não foi verificada',
                    codigo: 0
                })

                if (body.password === decrypt(array[0].password))
                    res.status(200).send({sucesso: true, status: 'ok', codigo: 1, dados: array[0]})
                else
                    res.status(200).send({sucesso: false, status: 'Senha incorreta', codigo: 0})
            })
            .catch(e => {
                res.status(400).send({sucesso: false, status: e.message, codigo: 0})
            })

    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const criaRegistro = async (req, res) => {
    try {
        const {body, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })

        const doc = await db.collection('free')
            .where('token', '==', tokenid)
            .where('cpf', '==', body.cpf)
            .get()

        const array = []
        doc.forEach(i => array.push(i.data()))

        if (array.length > 0)
            return res.status(200).send({sucesso: false, status: 'Esse CPF já está cadastrado', codigo: 0})
        body.password = encrypt(body.password)
        body.token = tokenid
        body.id = geraID()
        db.collection('free')
            .doc(body.id)
            .set(body)
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1, id: body.id}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        try {
            db.collection('ibini')
                .doc('free')
                .set({[tokenid]: {token: tokenid, data: moment().format('DD-MM-YYYY HH:mm:ss')}})
                .then(r => console.log(r))
        } catch (e) {

        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const verificaConta = async (req, res) => {
    try {
        const {body, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        const doc = await db.collection('free')
            .where('token', '==', tokenid)
            .where('status', '==', body.status)
            .get()
        const array = []
        doc.forEach(i => array.push(i.data()))
        if (array.length > 0) {
            const body = array[0]
            body.status = '0'
            delete body['password']
            db.collection('free')
                .doc(body.id)
                .update(body)
                .then(() => res.status(200).send({
                    sucesso: true,
                    status: 'Conta verificada com sucesso',
                    codigo: 1,
                    dados: body
                }))
                .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        } else {
            res.status(200).send({sucesso: false, status: 'Falha ao verificar conta', codigo: 0})
        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const recuperacao = async (req, res) => {
    try {
        const {body, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        const doc = await db.collection('free')
            .where('token', '==', tokenid)
            .where('email', '==', body.email)
            .get()
        const array = []
        doc.forEach(i => array.push(i.data()))
        if (array.length > 0)
            res.status(200).send({sucesso: true, status: 'ok', codigo: 1, id: array[0].id})
        else
            res.status(200).send({sucesso: false, status: 'E-mail não encontrado', codigo: 0})
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const alterarRegistro = (req, res) => {
    try {
        const {body, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection('free')
            .doc(body.id)
            .update(body)
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
        try {
            db.collection('ibini')
                .doc('free')
                .set({[tokenid]: {token: tokenid, data: moment().format('DD-MM-YYYY HH:mm:ss')}})
                .then(r => console.log(r))
        } catch (e) {

        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const alterarSenha = (req, res) => {
    try {
        const {body, headers: {token}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        body.password = encrypt(body.password)
        db.collection('free')
            .doc(body.id)
            .update(body)
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const deletaRegistro = (req, res) => {
    try {
        const {body, headers: {token, key}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        db.collection('free')
            .doc(body.id)
            .delete()
            .then(() => res.status(200).send({sucesso: true, status: 'ok', codigo: 1}))
            .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const encrypt = password => {
    try {
        const iv = Buffer.from(crypto.randomBytes(16))
        const cipher = crypto.createCipheriv(process.env.ALG, Buffer.from(process.env.SECRET), iv)
        let encrypted = cipher.update(password)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        encrypted = `${iv.toString('hex')}:${encrypted.toString('hex')}`
        return encrypted
    } catch (e) {
        console.log(e)
    }
}

const decrypt = password => {
    try {
        const [iv, encrypted] = password.split(':')
        const ivBuffer = Buffer.from(iv, 'hex')
        const decipher = crypto.createDecipheriv(process.env.ALG, Buffer.from(process.env.SECRET), ivBuffer)
        let content = decipher.update(Buffer.from(encrypted, 'hex'))
        content = Buffer.concat([content, decipher.final()])
        content = content.toString()
        return content
    } catch (e) {

    }
}

const geraID = () => {
    let wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let s = Array.from(crypto.randomFillSync(new Uint8Array(10))).map((x) => wishlist[x % wishlist.length]).join('')
    return `${s}${Math.floor(Math.random() * 999)}`
}
