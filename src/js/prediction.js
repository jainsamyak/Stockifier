const tf = require('@tensorflow/tfjs-node');
const db = require('./js/database');
const stockapi = require('./js/stockapi')
const currencySymbol = require('currency-symbol-map')
const Chart = require('chart.js')
const electron = require('electron');
const remote = electron.remote;

function minMaxScaler(val, min, max) {
    return (val - min) / (max - min);
}

function minMaxInverseScaler(val, min, max) {
    return val * (max - min) + min;
}

function getStocks() {
    $stocks = $('#stocksList');
    let conn = db.conn;

    conn.each('SELECT ID,"Index",StockName FROM Stocks', (err, row) => {
        if (err) {
            console.log(err);
        } else {
            $stocks.append(`
                <option value="`+ row['Index'] + `">` + row.StockName + ` - ` + row.Index + `</option>
            `);
        }
    });
}

function updatePredictChart($this) {

    $stock = $($this).val();
    let conn = db.conn;
    conn.get('SELECT * FROM Stocks WHERE "Index"=?', $stock, (err, row) => {
        predictChart.options.title.text = row.StockName;
    });

    stockapi.getStockHistoricalDaily($stock, (data) => {

        prices = data[0];
        let min = Math.min.apply(null, prices);
        let max = Math.max.apply(null, prices);
        prices = prices.map((el) => minMaxScaler(el, min, max));
        dates = data[1];
        var lookbackPrices = [];
        var targets = [];
        for (let index = 10; index < prices.length; index++) {
            lookbackPrices[index - 10] = prices.slice(index - 10, index);
            targets.push(prices[index]);
        }
        tfPrices = tf.tensor2d(lookbackPrices);
        global.pred = tf.tensor2d(lookbackPrices[0], [1, 10]);
        global.pred = tf.reshape(global.pred, [1, 10, 1]);
        tfTargets = tf.tensor1d(targets);
        tfPrices = tf.reshape(tfPrices, [prices.length - 10, 10, 1]);
        //tfPrices.print();
        //tfTargets.print();


        const model = tf.sequential();
        model.add(tf.layers.lstm({ units: 64, inputShape: [10, 1] }));
        /* model.add(tf.layers.lstm({ units: 32, inputShape: [10, 1], returnSequences: true }));
    model.add(tf.layers.lstm({ units: 32, inputShape: [10, 1] })); */
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        const lr = 0.01;
        const opt = tf.train.adam(lr);
        const loss = 'meanSquaredError';
        model.compile({ optimizer: opt, loss: loss, metrics: ['accuracy'] });


        async function fit() {
            t = targets.map((el) => minMaxInverseScaler(el, min, max));
            t = t.slice(t.length - 100, t.length);
            predictChart.data.labels = dates.slice(dates.length - 100, dates.length);

            const resp = await model.fit(tfPrices, tfTargets, {
                epochs: 10,
                callbacks: {
                    onEpochEnd: (epoch, log) => {
                        console.log(`Epoch ${epoch}: loss = ${log.loss}`)
                        pred = model.predict(tfPrices);
                        pred.data().then(d => {
                            ds = d.map((el) => minMaxInverseScaler(el, min, max));
                            ds = ds.slice(d.length - 100, d.length);
                            //console.log(ds);
                            predictChart.data.datasets[0].data = t;
                            predictChart.data.datasets[1].data = ds;
                            //predictChart.data.labels = Array(50);
                            predictChart.update();

                        });
                    }
                },
                shuffle: true
            });


        }
        fit().then(() => {
            stockapi.getDataForPrediction($stock, (data) => {
                prices = data[0];
                dates = data[1];
                finalValues = prices;
                tfTest = tf.tensor3d(prices.map((el) => minMaxScaler(el, min, max)), [1, prices.length, 1]);
                tfPred = model.predict(tfTest);
                console.log("Final Prediction: ");
                tfPred.data().then(d => {
                    console.log(d.map((el) => minMaxInverseScaler(el, min, max)));
                    finalValues.push(d.map((el) => minMaxInverseScaler(el, min, max)));
                });
                //predictChart.data.datasets[2].data = finalValues;
            });
        });
    });
}

var ctx = $('#predictChart')
var predictChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            type: 'line',
            label: 'Actual',
            fill: false,
            data: [],
            borderColor: 'red',
            pointRadius: 0
        }, {
            type: 'line',
            label: 'Predicted',
            fill: false,
            data: [],
            borderColor: 'green',
            pointRadius: 0
        }, {
            type: 'line',
            label: 'Forecast',
            fill: false,
            data: [],
            borderColor: 'blue'
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            //text: 'Select a Stock and Indicator to view characterstics'
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false
                },
                distribution: 'series',
                type: 'time'
            }],
            yAxes: [{
                type: 'linear',
                gridLines: {
                    display: false
                }
            }]
        }
    }
});









$(document).ready(function () {
    getStocks();
});


const select = document.querySelectorAll('.mdc-select');
for (const s of select) {
    mdc.select.MDCSelect.attachTo(s);
}
