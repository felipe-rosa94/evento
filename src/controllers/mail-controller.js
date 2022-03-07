require('dotenv').config()
const nodemailer = require('nodemailer')

exports.post = ('/', (req, res) => {
    mail(req, res)
})

const mail = (req, res = null) => {
    try {
        let remetente = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: process.env.PORTA,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.SENHA
            }
        })

        const {to, subject, text, html} = req.body

        if (!to) {
            if (res) res.status(400).send({sucesso: false, codigo: 0, status: 'Erro! envie os dados corretamente.'})
            return
        }

        let email = {
            from: process.env.EMAIL,
            to: to,
            subject: subject,
            text: text,
            html: html
        }

        remetente.sendMail(email, function (error) {
            if (error) {
                if (res) res.status(400).send({sucesso: false, codigo: 0, status: error})
            } else {
                if (res) res.status(200).send({sucesso: true, codigo: 1, status: 'Email enviado com sucesso.'})
            }
        })
    } catch (e) {
        res.status(200).send({codigo: 0, status: e.message})
    }
}
