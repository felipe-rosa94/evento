require('dotenv').config()
const firebase = require('../firebase')

exports.put = ('/', (req, res) => {
    alterarImagem(req, res)
})

const alterarImagem = async (req, res) => {
    try {
        const {body: {imagem, tipo, cpf}, headers: {token, tokenid}} = req
        if (token !== process.env.TOKEN_1) return res.status(200).send({
            sucesso: false,
            status: 'token inválido',
            codigo: 0
        })
        const base64Image = imagem.split(';base64,').pop()
        const buffer = Buffer.from(base64Image, 'base64')
        const {_delegate: {state}} = await firebase
            .storage()
            .ref(`imagens/${tokenid}/${tipo}-${cpf}`)
            .put(buffer, {contentType: 'image/jpeg'})
        if (state === 'success') {
            let url = await firebase
                .storage()
                .ref(`imagens/${tokenid}/${tipo}-${cpf}`)
                .getDownloadURL()
            res.status(200).send({sucesso: true, dados: url, codigo: 1})
        } else {
            res.status(200).send({sucesso: false, status: 'Falha ao fazer upload imagem', codigo: 0})
        }
    } catch (e) {
        res.status(500).send({sucesso: false, status: e.message, codigo: 0})
    }
}