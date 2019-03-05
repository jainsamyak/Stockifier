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


    $('#btnAddStock').on('click', () => {

        val = $('#typeahead').val();
        if (val.includes('(') && val.includes(')')) {
            stIndex = val.split('(')[1];
            stIndex = stIndex.split(')')[0];
            val = val.split('(')[0];
            val = val.split(' ').splice(0, 1).join(" ");
            let conn = db.initDB();
            console.log(val);
            stockapi.searchStock(val, (data) => {
                console.log(String(data));
                data = JSON.parse(data).bestMatches;
                console.log(data);
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];

                    if (element['1. symbol'] == stIndex) {

                        insertStockQry = "INSERT INTO Stocks ('Stockname','Index','High','Low','Currency') VALUES ('" + element['2. name'] + "','" + stIndex + "',0,0,'" + element['8. currency'] + "')"
                        console.log(insertStockQry);
                        conn.run(insertStockQry, (err) => {
                            if (err) console.log(err);

                            alert("Statements executed");
                            initializeStockView();

                        });
                        break;
                    }
                }

            });
        }
        else {
            alert("here")
            try {
                val = val.split(' ').splice(0, 1).join(" ");
                console.log(val);
                stockapi.searchStock(val, (data) => {
                    console.log(String(data));

                    data = JSON.parse(data).bestMatches;
                    data = data[0];

                    insertStockQry = "INSERT INTO Stocks ('Stockname','Index','High','Low','Currency') VALUES ('" + data['2. name'] + "','" + data['1. symbol'] + "',0,0,'" + data['8. currency'] + "')"
                    console.log(insertStockQry);
                    conn.run(insertStockQry, (err) => {
                        if (err) console.log(err);

                        alert("Statements executed");
                        initializeStockView();

                    });
                });
            } catch (error) {
                alert("Stock not found!");
            }
        }
        //console.log(val);

    });

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

    /* Initialize stocks view */
    function initializeStockView() {
        conn = db.initDB();
        console.log(conn);
        $stocksList = $('#myStocks');
        $stocksList.val('');
        conn.each("SELECT ID,\"Index\",StockName,High,Low FROM Stocks", function (err, row) {
            $stocksList.append(`
            <li class="list-group-item justify-content-center align-items-center list-group-item-action">
                <div class="mr-auto p-2" id="stockTitle"><b>`+ row.Index + `</b><br>
                        <span id="stockTitle">`+ row.StockName + `</span></div>
                    <div class="badge badge-success badge-pill p-2">High: `+ row.High + `</div>
                    <div class="p-2">
                        <button class="mdc-fab mdc-fab--mini notify">
                            <span class="mdc-fab__icon material-icons">notifications_active</span>
                        </button>
                        <button class="mdc-fab mdc-fab--mini delete">
                            <span class="mdc-fab__icon material-icons">delete</span>
                        </button>
    
    
                    </div>
            </li>
            `);
        });
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