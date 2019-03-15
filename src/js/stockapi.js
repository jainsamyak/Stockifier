//const apiKey = window.localStorage.apiKey;
const apiKey = '0M1OCUZTI229BTFV';
const alpha = require('alphavantage')({ key: apiKey })
const https = require('https')

function searchStock(stockName, callback) {
    let apiUrl = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + stockName + '&apikey=' + apiKey
    https.get(apiUrl, (res) => {
        res.on('data', (data) => {
            //console.log(String(data))

            //console.log(results);

            callback(data)
        })
    })
}

function getStockQuote(stockID, callback) {
    alpha.data.quote(stockID).then(data => {
        callback(data['Global Quote']['05. price'])
    });
}
function getStockUpdates(stockID, callback) {
    alpha.data.quote(stockID).then(data => {
        callback(data)
    });
}

function getStockData(stockID, callback) {
    alpha.data.intraday(stockID, 'compact', 'json', '1min').then(data => {
        data = data['Time Series (1min)'];
        callback(data);
    });
}

module.exports = {
    searchStock: searchStock,
    alphavantage: alpha,
    getStockQuote: getStockQuote,
    getStockData: getStockData,
    getStockUpdates:getStockUpdates
}
