const apiKey = window.localStorage.apiKey;
const alpha = require('alphavantage')({ key: apiKey })
const https = require('https')

function searchStock(stockName, callback) {
    let apiUrl = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + stockName + '&apikey=' + apiKey
    https.get(apiUrl, (res) => {
        res.on('data', (data) => {
            callback(data)
        })
    })
}

function getStockQuote(stockID, callback) {
    alpha.data.quote(stockID).then(data => {
        callback(data['Global Quote']['05. price'])
    }).catch(err=>{
        openSnackbar('API timed out! Please try again in a few seconds....')
    });
}
function getPreviousStockClose(stockID, callback) {
    alpha.data.quote(stockID).then(data => {
        callback(data['Global Quote']['08. previous close'])
    }).catch(err=>{
        openSnackbar('API timed out! Please try again in a few seconds....')
    });
}
function getStockUpdates(stockID, callback) {
    alpha.data.quote(stockID).then(data => {
        callback(data)
    });
}

function getStockData(stockID, callback) {


    alpha.data.intraday(stockID, 'compact', 'json', '5min').then(data => {

        data = data['Time Series (5min)'];
        let keys = Object.keys(data);
        let dates = [];
        let prices = [];
        let volumes = [];
        let today = keys[0].split(' ')[0];
        let i = 0
        for (const key of keys) {
            if (keys[i].split(' ')[0] != today) {
                break;
            }
            dates.push(keys[i]);
            prices.push(Number(data[key]['4. close']));
            volumes.push(Number(data[key]['5. volume']));
            i += 1;
        }
        console.log(dates.length);
        callback([dates.reverse(), prices.reverse(), volumes.reverse()])

    }).catch(err=>{
        openSnackbar('API timed out! Please try again in a few seconds....')
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
        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
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
        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
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
        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
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
        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
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

                dates.push(keys[i]);
                prices.push(Number(data[key]['5. adjusted close']));
                volumes.push(Number(data[key]['6. volume']));
                i += 1;
            }
            callback([prices, volumes, dates]);

        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
        });;

    }

}

function getStockIndicator(stockID, indicator, callback) {
    if (indicator == "EMA") {
        alpha.technical.ema(stockID, 'weekly', 60, 'close').then(data => {
            data = data['Technical Analysis: EMA'];
            keys = Object.keys(data);
            let i = 0;
            dates = [];
            prices = [];
            while (i <= 50) {
                dates.push(keys[i]);
                prices.push(data[keys[i]]['EMA']);
                i += 1;
            }
            callback([prices, dates]);
            return;
        }).catch(err=>{
            openSnackbar('API timed out! Please try again in a few seconds....')
        });
    } else if (indicator == "RSI") {
        alpha.technical.rsi(stockID, 'weekly', 60, 'close').then(data => {
            data = data['Technical Analysis: RSI'];
            keys = Object.keys(data);
            let i = 0;
            dates = [];
            prices = [];
            while (i <= 50) {
                dates.push(keys[i]);
                prices.push(data[keys[i]]['RSI']);
                i += 1;
            }
            callback([prices, dates]);
            return;
        })
    } else if (indicator == "SMA") {
        alpha.technical.sma(stockID, 'weekly', 60, 'close').then(data => {
            data = data['Technical Analysis: SMA'];
            keys = Object.keys(data);
            let i = 0;
            dates = [];
            prices = [];
            while (i <= 50) {
                dates.push(keys[i]);
                prices.push(data[keys[i]]['SMA']);
                i += 1;
            }
            callback([prices, dates]);
            return;
        })
    }
}

function getStockHistoricalDaily(stockID, callback) {



    alpha.data.daily_adjusted(stockID, 'full', 'json').then(data => {
        data = data['Time Series (Daily)'];
        let keys = Object.keys(data);
        keys = keys.reverse()
        let dates = [];
        let prices = [];
        let i = 0

        while (i < 500) {
            dates.push(keys[keys.length - 1 - i]);
            prices.push(Number(data[keys[keys.length - 1 - i]]['5. adjusted close']));
            i += 1;
        }
        console.log(keys.length);
        callback([prices.reverse(), dates.reverse()]);
    }).catch(err=>{
        openSnackbar('API timed out! Please try again in a few seconds....')
    });


}

function getDataForPrediction(stockID, callback) {

    alpha.data.daily_adjusted(stockID, 'compact', 'json').then(data => {

        data = data['Time Series (Daily)'];
        let keys = Object.keys(data);
        keys = keys.reverse()
        let dates = [];
        let prices = [];
        let i = 0
        while (i < 10) {
            dates.push(keys[keys.length - 1 - i]);
            prices.push(Number(data[keys[keys.length - 1 - i]]['5. adjusted close']));
            i += 1;
        }

        callback([prices.reverse(), dates.reverse()]);
    }).catch(err=>{
        openSnackbar('API timed out! Please try again in a few seconds....')
    });

}

module.exports = {
    searchStock: searchStock,
    alphavantage: alpha,
    getStockQuote: getStockQuote,
    getPreviousStockClose: getPreviousStockClose,
    getStockData: getStockData,
    getStockUpdates: getStockUpdates,
    getStockPrices: getStockPrices,
    getStockIndicator: getStockIndicator,
    getStockHistoricalDaily: getStockHistoricalDaily,
    getDataForPrediction: getDataForPrediction
}
