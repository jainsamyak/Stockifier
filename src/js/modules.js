const db = require('./js/database');
const stockapi = require('./js/stockapi')

var substringMatcher = function () {
    return function findMatches(string, syncWait, cb) {
        stockapi.searchStock(string, (matches) => {
            console.log(string);
            cb(matches);
        })

    };
};




$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


$(document).ready(function () {


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
    conn = db.initDB();
    console.log(conn);
    $stocksList = $('#myStocks');
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



    $("#txtStockSearch").on("keyup", function () {
        console.log("press")
        var value = $(this).val().toLowerCase();
        console.log(value)
        $("#myStocks li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});