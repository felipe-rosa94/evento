require('dotenv').config()
const admin = require('../admin')
const firebase = require('../firebase')
const moment = require('moment')
const db = admin.firestore()

exports.post = ('/', (req, res) => {
    backup(req, res)
})

exports.put = ('/', (req, res) => {
    restore(req, res)
})

const backup = async (req, res) => {
    try {
        const {headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        let collection = []
        for (const b of req.body) {
            let array = []
            let doc = await db.collection(b)
                .where('token', '==', tokenid)
                .get()
                .catch(e => res.status(400).send({sucesso: false, status: e.message, codigo: 0}))
            doc.forEach(i => array.push(i.data()))
            collection.push({collection: b, dados: array})
        }
        let data = moment().format('DD-MM-YYYY')
        let urls = []
        for (const c of collection) {
            const buffer = Buffer.from(JSON.stringify(c.dados))
            const {_delegate: {state}} = await firebase
                .storage()
                .ref(`backup/${tokenid}/${c.collection}/${data}`)
                .put(buffer, {contentType: 'application/json'})
            if (state === 'success') {
                let url = await firebase
                    .storage()
                    .ref(`backup/${tokenid}/${c.collection}/${data}`)
                    .getDownloadURL()
                urls.push({[c.collection]: url})
            }
        }
        res.status(200).send({sucesso: true, data: urls, codigo: 1})
    } catch (e) {
        res.status(400).send({sucesso: false, status: e.message, codigo: 0})
    }
}

const restore = async (req, res) => {
    try {
        const {body: {collection, dados}, headers: {token}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        for (const d of dados) {
            await db.collection(collection)
                .doc(d.id)
                .set(d)
        }
        res.status(200).send({sucesso: true, status: 'Backup restaurado com sucesso', codigo: 1})
    } catch (e) {
        res.status(400).send({sucesso: false, status: e.message, codigo: 0})
    }
}