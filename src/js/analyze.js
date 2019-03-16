const db = require('./js/database');
const stockapi = require('./js/stockapi')
const currencySymbol = require('currency-symbol-map')
const Chart = require('chart.js')
const electron = require('electron');
const remote = electron.remote;

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

function updatePriceChart(interval) {

    let stockID = $('#stocksList').val();
    let conn = db.conn;
    conn.get('SELECT * FROM Stocks WHERE "Index"=?', stockID, (err, row) => {
        priceChart.options.title.text = row.StockName;
    });

    stockapi.getStockPrices(stockID, interval, (data) => {

        console.log(data);
        time_series_points = data[0];
        volumes = data[1];
        dates = data[2];

        /* Dynamic updation of chart */
        priceChart.data.labels = dates;
        priceChart.data.datasets[0].data = time_series_points;
        priceChart.data.datasets[1].data = volumes;
        if (interval == "max") {
            priceChart.data.datasets[0].pointRadius = 0;
        }
        priceChart.update();

    });
}


var ctx = $('#priceChart')
var priceChart = new Chart(ctx, {
    type: 'bar',
    data: {
        type: 'bar',
        datasets: [{
            type: 'line',
            label: 'Stock Price',
            fill: false,
            data: [],
            borderWidth: 2,
            borderColor: 'rgba(196, 22, 98,1)',
            backgroundColor: 'rgba(196, 22, 98,1)',
            pointRadius: 3,
            yAxisID: 'price'
        }, {
            type: 'bar',
            label: 'Volume',
            fill: false,
            data: [],
            backgroundColor: 'rgba(190, 135, 211,0.4)',
            yAxisID: 'volume'
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Select a Stock to view performance'
        },
        scales: {
            xAxes: [{
                display: false,
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                type: 'linear',
                position: 'left',
                id: 'price',
                gridLines: {
                    display: false
                }
            }, {
                type: 'linear',
                position: 'right',
                id: 'volume',
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

const textfields = document.querySelectorAll('.mdc-text-field');
for (const tf of textfields) {
    mdc.textField.MDCTextField.attachTo(tf);
}
const buttons = document.querySelectorAll('button');
for (const button of buttons) {
    mdc.ripple.MDCRipple.attachTo(button);
}

mdc.select.MDCSelect.attachTo(document.querySelector('.mdc-select'));
