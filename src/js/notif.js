const db = require('./js/database');
const stockapi = require('./js/stockapi')
const currencySymbol = require('currency-symbol-map')
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
function getAlerts(params) {
    let conn = db.conn;
    $('#alertsView').html('');
    conn.each('SELECT a.*,s."Index" FROM Alerts a,Stocks s WHERE a.StockID=s.ID', (err, row) => {
        let autoren = 'No';
        let type = "Rising";
        if (row['Auto_Renew'] == 1) {
            autoren = 'Yes';
        }
        if (row['direction'] == "down") {
            type = "Falling";
        }

        $('#alertsView').append(`
        <tr class="align-middle">
            <td>`+ row['Index'] + `</td>
            <td>`+ row['TargetPrice'] + `</td>
            <td>`+ autoren + `</td>
            <td>`+ row['frequency'] + ` min</td>
            <td>`+ type + `</td>
            <td>
                <button class="mdc-fab mdc-fab--mini delete" aria-label="Delete" onclick='deleteAlert(`+ row['ID'] + `)'>
                    <span class="mdc-fab__icon material-icons">delete</span>
                </button>
            </td>
        </tr>
        
        `);
    });
}
function getCurrentVal(params) {
    $stock = $('#stocksList').val();
    let conn = db.conn;
    $('#txtStockVal').val("Loading")
    conn.get('SELECT Currency FROM Stocks WHERE "Index"=?', $stock, (err, row) => {
        let currency = row.Currency;
        $('#txtCurrencySymbol').html(currencySymbol(currency));
    });
    stockapi.getStockQuote($stock, (price) => {
        $('#txtStockVal').val(price)
    });
}
function deleteAlert(alertID) {
    let conn = db.conn;
    conn.run("DELETE FROM Alerts WHERE ID=?", alertID, (err) => {

        if (err) {
            openSnackbar(err);
        }
        else {
            openSnackbar("Alert Deleted!");
        }
        getAlerts();
    })

}

const sb = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));
function openSnackbar(snackbarMsg) {
    $snackbar = $("#snackbar-msg");
    $snackbar.text(snackbarMsg);
    sb.open();
    setTimeout(() => {
        sb.close()
    }, 5000);

}
function setNotification() {



    $stock = $('#stocksList').val();
    $currVal = Number($('#txtStockVal').val());
    $newVal = $('#txtTargetVal').val();
    $updateFreq = $('#txtFrequency').val();
    $autoRenew = Number($('#chkAutoRenew').is(':checked'));
    let conn = db.conn;
    $btnBeat = Number($('#chkBeating').is(':checked'));
    if ($btnBeat == 0) {
        $beating = "down";
    } else {
        $beating = "up";
    }
    conn.get('SELECT ID FROM Stocks WHERE "Index"=?', $stock, (err, row) => {

        if (err) {
            openSnackbar(err);
        }

        try {


            let stockID = row["ID"];

            $alertQry = "INSERT INTO Alerts (StockID,TargetPrice,direction,Auto_Renew,frequency) Values(?,?,'" + $beating + "',?,?)";

            conn.run($alertQry, [stockID, $newVal, $autoRenew, $updateFreq], (err) => {
                if (err) {
                    alert(err);

                }
                else {
                    $('#alertForm').trigger("reset");
                    openSnackbar("Alert Added!");

                }

            });

        } catch (error) {
            openSnackbar("Please check all fields! " + error);
        } finally {
            getAlerts();
        }


    });



}
$(document).ready(function () {
    getStocks();

    $('#closeWindow').on('click', () => {
        remote.getCurrentWindow().close();
    });
    getAlerts();

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
