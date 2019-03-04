const apiKey = '0M1OCUZTI229BTFV'
const alpha = require('alphavantage')({ key: apiKey })
const https = require('https')


function searchStock(stockName, callback) {
    let apiUrl = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + stockName + '&apikey=' + apiKey
    https.get(apiUrl, (res) => {
        res.on('data', (data) => {
            //console.log(String(data))
            let d = (JSON.parse(data)).bestMatches;
            let results = []
            d.forEach(element => {
                results.push(element['2. name'])
            });
            //console.log(results);
            callback(results)
        })
    })
}

module.exports.searchStock = searchStock;