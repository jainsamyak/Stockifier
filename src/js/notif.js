const db = require('./js/database');
const stockapi = require('./js/stockapi')


function getStocks() {
    $stocks = $('#stocksList');
    let conn = db.conn;


    conn.each('SELECT ID,"Index",StockName FROM Stocks', (err, row) => {
        if (err) {
            console.log(err);
        } else {
            $stocks.append(`
                <option value="`+ row['Index'] + `">` + row.StockName + `</option>
            `);
        }
    });
}
function getCurrentVal(params) {
    $stock = $('#stocksList').val();
    stockapi.getStockQuote($stock, (price) => {
        $('#txtStockVal').val(price)
    });
}
function setNotification() {
    $stock = $('#stocksList').val();
    $currVal = $('#txtStockVal').val();
    $newVal = $('#txtTargetVal').val();
    let conn = db.conn;
    conn.get('SELECT ID FROM Stocks WHERE "Index"=?', $stock, (err, row) => {

        let stockID = row["ID"];
        if ($newVal > $currVal) {
            $alertQry = "INSERT INTO Alerts (StockID,TargetPrice,direction) Values(?,?,'up')";
        }
        else {
            $alertQry = "INSERT INTO Alerts (StockID,TargetPrice,direction) Values(?,?,'down')";

        }
        conn.run($alertQry, [stockID, $newVal], () => {
            alert("Done!");
        })
    });

}
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

select = mdc.select.MDCSelect.attachTo(document.querySelector('.mdc-select'));