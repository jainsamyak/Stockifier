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

function getStockPrices(stockID, interval, callback) {
    if (interval == "min") {
        alpha.data.intraday(stockID, 'compact', 'json', '1min').then(data => {
            data = data['Time Series (1min)'];

            let keys = Object.keys(data);
            keys = keys.reverse()
            let dates = [];
            let prices = [];
            let volumes = [];
            let i = 0
            for (const key of keys) {
                if (i % 5 == 0) {
                    dates.push(keys[i]);
                    prices.push(Number(data[key]['4. close']));
                    volumes.push(Number(data[key]['5. volume']));
                }
                i += 1;
            }
            callback([prices, volumes, dates]);
        });
    } else if (interval == "week") {
        alpha.data.intraday(stockID, 'compact', 'json', '60min').then(data => {
            console.log(data)
            data = data['Time Series (60min)'];
            let keys = Object.keys(data);
            keys = keys.reverse()
            let dates = [];
            let prices = [];
            let volumes = [];
            let i = 0
            while (i <= 42) {
                dates.push(keys[keys.length - 1 - i]);
                prices.push(Number(data[keys[keys.length - 1 - i]]['4. close']));
                volumes.push(Number(data[keys[keys.length - 1 - i]]['5. volume']));
                i += 1;
            }
            callback([prices.reverse(), volumes.reverse(), dates.reverse()]);
        });

    } else if (interval == "month") {
        alpha.data.daily_adjusted(stockID).then(data => {
            data = data['Time Series (Daily)'];
            let keys = Object.keys(data);
            keys = keys.reverse()
            let dates = [];
            let prices = [];
            let volumes = [];
            let i = 0
            let d = new Date();
            let today = d.getDate();
            let currMonth = d.getMonth();
            while ((String(keys[keys.length - 1 - i]).split('-')[2] < today && String(keys[keys.length - 1 - i]).split('-')[1] != currMonth) || (String(keys[keys.length - 1 - i]).split('-')[2] > today && String(keys[keys.length - 1 - i]).split('-')[1] == currMonth)) {
                dates.push(keys[keys.length - 1 - i]);
                prices.push(Number(data[keys[keys.length - 1 - i]]['5. adjusted close']));
                volumes.push(Number(data[keys[keys.length - 1 - i]]['6. volume']));
                i += 1;
            }
            callback([prices.reverse(), volumes.reverse(), dates.reverse()]);
        });

    } else if (interval == "6months") {
        alpha.data.weekly_adjusted(stockID).then(data => {
            data = data['Weekly Adjusted Time Series'];
            let keys = Object.keys(data);
            keys = keys.reverse()
            let dates = [];
            let prices = [];
            let volumes = [];
            let i = 0
            let d = new Date();
            let today = d.getDate();
            let currMonth = d.getMonth();
            while (i <= 25) {
                dates.push(keys[keys.length - 1 - i]);
                prices.push(Number(data[keys[keys.length - 1 - i]]['5. adjusted close']));
                volumes.push(Number(data[keys[keys.length - 1 - i]]['6. volume']));
                i += 1;
            }

            callback([prices.reverse(), volumes.reverse(), dates.reverse()]);
        });

    } else if (interval == "max") {
        alpha.data.monthly_adjusted(stockID).then(data => {
            data = data['Monthly Adjusted Time Series'];
            let keys = Object.keys(data);
            keys = keys.reverse()
            let dates = [];
            let prices = [];
            let volumes = [];
            let i = 0
            let d = new Date();
            let today = d.getDate();
            let currMonth = d.getMonth();
            for (const key of keys) {

                dates.push(keys[keys.length - 1 - i]);
                prices.push(Number(data[key]['5. adjusted close']));
                volumes.push(Number(data[key]['6. volume']));
                i += 1;
            }
            callback([prices, volumes, dates]);

        });

    }

}

module.exports = {
    searchStock: searchStock,
    alphavantage: alpha,
    getStockQuote: getStockQuote,
    getStockData: getStockData,
    getStockUpdates: getStockUpdates,
    getStockPrices: getStockPrices
}
