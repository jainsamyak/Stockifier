const db = require('./js/database');
const stockapi = require('./js/stockapi')

var stockMatches = []; //Global variable for stock matches
var substringMatcher = function () {
    return function findMatches(string, syncWait, cb) {
        stockapi.searchStock(string, (data) => {
            try {
                let d = (JSON.parse(data)).bestMatches;
                let results = []
                d.forEach(element => {
                    results.push(element['2. name'] + ' (' + element['1. symbol'] + ')')
                });
                window.stockMatches = results;

            } catch (error) {
                //do nothing
            }
            finally {
                console.log(string);
                cb(stockMatches);
            }
        })

    };
};




$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


$(document).ready(function () {


    $('.dropdown-menu').click(function (e) {
        e.stopPropagation();
    });
    $('#btnAddStock').on('click', () => {

        $('.dropdown').dropdown("toggle");
        val = $('#typeahead').val();
        if (val.includes('(') && val.includes(')')) {
            stIndex = val.split('(')[1];
            stIndex = stIndex.split(')')[0];
            val = val.split('(')[0];
            val = val.split(' ').splice(0, 1).join(" ");
            let conn = db.initDB();
            console.log(val);
            try {

                stockapi.searchStock(val, (data) => {
                    console.log(String(data));
                    try {
                        data = JSON.parse(data).bestMatches;

                    } catch (error) {
                        openSnackbar("An error occured");
                        return;
                    }
                    console.log(data);
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];

                        if (element['1. symbol'] == stIndex) {

                            insertStockQry = "INSERT INTO Stocks ('Stockname','Index','High','Low','Currency') VALUES ('" + element['2. name'] + "','" + stIndex + "',0,0,'" + element['8. currency'] + "')"
                            console.log(insertStockQry);
                            conn.run(insertStockQry, (err) => {
                                if (err) console.log(err);

                                openSnackbar("Stock Added!");
                                initializeStockView();

                            });
                            break;
                        }
                    }

                });

            } catch (error) {
                alert("An error occured!" + error);
            }
        }
        else {
            try {
                val = val.split(' ').splice(0, 1).join(" ");
                console.log(val);
                stockapi.searchStock(val, (data) => {
                    console.log(String(data));

                    try {
                        data = JSON.parse(data).bestMatches;

                    } catch (error) {
                        openSnackbar("An error occured");
                        return;
                    }
                    data = data[0];

                    insertStockQry = "INSERT INTO Stocks ('Stockname','Index','High','Low','Currency') VALUES ('" + data['2. name'] + "','" + data['1. symbol'] + "',0,0,'" + data['8. currency'] + "')"
                    console.log(insertStockQry);
                    conn.run(insertStockQry, (err) => {
                        if (err) console.log(err);

                        openSnackbar("Stock Added!");
                        initializeStockView();

                    });
                });
            } catch (error) {
                alert("An error occured!" + error);
            }
        }
        //console.log(val);

    });

    /* Typeahead instance */
    $('#the-basics .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 3

    },
        {
            name: 'stocks',
            source: substringMatcher()
        });

    /* Initialize ripple for all buttons */
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
        mdc.ripple.MDCRipple.attachTo(button);
    }
    const textfields = document.querySelectorAll('.mdc-text-field');
    for (const tf of textfields) {
        mdc.textField.MDCTextField.attachTo(tf);
    }


    const dialog = mdc.dialog.MDCDialog.attachTo(document.querySelector('.mdc-dialog'));

    function openDeleteDialog(dialogTitle, dialogMsg, deleteID) {
        $dialogTitle = $("#my-dialog-title");
        $dialogmsg = $('#my-dialog-content');
        $dialogTitle.text(dialogTitle);
        $dialogmsg.text(dialogMsg);
        dialog.open();

        dialog.listen('MDCDialog:closing', (action) => {
            let actionSel = action.detail.action;
            let conn = db.conn;
            if (actionSel == "yes") {
                delStockQry = "DELETE FROM Stocks WHERE ID=?";
                conn.run(delStockQry, deleteID, (err) => {
                    if (err) {
                        return openSnackbar("Unable to delete!");
                    }
                    openSnackbar("Deleted successfully!");
                    initializeStockView();
                });
            }
        })
    }
    /* Function to handle stockDelete */
    $(document).on('click', ".btnDeleteStock", function () {
        openDeleteDialog("Delete Stock", "Are you sure you want to delete the stock?", $(this).attr('data-delete-id'));
    })

    const sb = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));
    function openSnackbar(snackbarMsg) {
        $snackbar = $("#snackbar-msg");
        $snackbar.text(snackbarMsg);
        sb.open();
        setTimeout(() => {
            sb.close()
        }, 5000);

    }

    /* Initialize stocks view */
    function initializeStockView() {
        let conn = db.initDB();
        console.log(conn);
        $stocksList = $('#myStocks');
        $stocksList.html('');
        conn.get("SELECT COUNT(*) as count FROM Stocks", (err, row) => {
            if (row.count > 0) {
                conn.each("SELECT ID,\"Index\",StockName,High,Low FROM Stocks", function (err, row) {
                    $stocksList.append(`
            
                    <li class="list-group-item justify-content-center align-items-center">
                        <div class="mr-auto p-2" id="stockTitle"><b>`+ row.Index + `</b><br>
                                <span id="stockTitle">`+ row.StockName + `</span></div>
                            <div class="badge badge-success badge-pill p-2">High: `+ row.High + `</div>
                            <div class="p-2">
                                <button class="mdc-fab mdc-fab--mini notify" data-notify-id=`+ row.ID + `>
                                    <span class="mdc-fab__icon material-icons">notifications_active</span>
                                </button>
                                <button class="mdc-fab mdc-fab--mini delete btnDeleteStock" data-delete-id=`+ row.ID + `>
                                    <span class="mdc-fab__icon material-icons">delete</span>
                                </button>
                            </div>
                    </li>
                    `);
                });
            }
            else {
                $stocksList.html(`
            
                    <li class="list-group-item justify-content-center align-items-center">
                        No stocks found!
                    </li>
                    `);
            }
        })

    }
    initializeStockView();



    $("#txtStockSearch").on("keyup", function () {
        console.log("press")
        var value = $(this).val().toLowerCase();
        console.log(value)
        $("#myStocks li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});