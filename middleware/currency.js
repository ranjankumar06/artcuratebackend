const fetch = require('node-fetch');

const CurrencyFormat = require('../modules/currency/models');

let currency = () => {
    const url = 'http://data.fixer.io/api/latest?access_key=8ee82b3ed9699c5dba2d90ea7d836e1f&format=1';
    const filter = { baseCurrency: 'EUR' };
    try {
        fetch(url).then(data => data.json()).then(json => {
            let rate = [];
            for (const [key, val] of Object.entries(json.rates)) {
                let currency = {
                    code: key,
                    value: val
                }
                rate.push(currency);
            }
            let rateObj = {
                baseCurrency: json.base,
                rate: rate,
                createdDate: new Date()
            }

            CurrencyFormat.findOneAndUpdate(filter, rateObj, { new: true, upsert: true, rawResult: true }, (err, currency) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Update Currency Data');
                }
            });
        });
    } catch (err) {
        console.log(err.message);
    }
}
module.exports = currency;