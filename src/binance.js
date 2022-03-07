const axios = require('axios')
const firebase = require('./firebase')
const admin = require('./admin')
const db = admin.firestore()

const main = () => {
    verificaMoedas()
}

const verificaMoedas = () => {
    try {
        setInterval(async () => {
            const moedas = ['BTCBUSD', 'ETHBUSD']
            const valoresMoedas = []
            for (const m of moedas) {
                let response = await axios({
                    method: 'GET',
                    url: 'https://api.binance.com/api/v3/ticker/price'
                })
                if (response.status === 200) {
                    let s = response.data.filter((f) => {
                        return f.symbol === m
                    })
                    valoresMoedas.push({crypto: [m], valor: s[0].price})
                }
            }

            let s = {}

            valoresMoedas.forEach(i => s[i.crypto] = i.valor)

            const dataAtual = new Date()
            const dataExpira = new Date()
            dataExpira.setHours(dataExpira.getHours() + 12)

            let json = {
                id: new Date().getTime(),
                date: new Date().toISOString(),
                crypto: s,
                expira: dataExpira
            }

            db
                .collection('binance')
                .doc(`${json.id}`)
                .set(json)
                .then(() => {
                    console.log('')
                })
                .catch(e => {
                    console.log(e)
                })

            let doc1 = await db
                .collection('binance')
                .where('expira', '<', dataAtual)
                .get()

            const array1 = []
            doc1.forEach(i => array1.push(i.data()))

            array1.forEach(i => {
                db.collection('binance')
                    .doc(`${i.id}`)
                    .delete()
            })

            let doc2 = await db
                .collection('binance')
                .where('expira', '!=', null)
                .get()

            const array2 = []
            doc2.forEach(d => array2.push(d.data()))

            const buffer = Buffer.from(JSON.stringify(array2))

            firebase
                .storage()
                .ref(`binance/moedas.json`)
                .put(buffer, {contentType: 'application/json'})
        }, 300000)
    } catch (e) {

    }
}

module.exports = main()