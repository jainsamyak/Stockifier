const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('stocksDB');


function initDB() {

    db.serialize(function () {
        db.run(`CREATE TABLE IF NOT EXISTS "Stocks" (
	"ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
        "StockName"	TEXT,
        "Index"	TEXT,
        "High"	NUMERIC,
        "Low"	NUMERIC
    )`);

        /* var stmt = db.prepare("INSERT INTO Stocks ('Stockname','Index','High','Low') VALUES (?,?,?,?)");
        for (var i = 0; i < 10; i++) {
    
            var d = new Date();
            var n = d.toLocaleTimeString();
            stmt.run('TCS', 'NSE:TCS', i, i + 1999);
        }
        stmt.finalize(); */


    });

    //db.close();
    return db
}


module.exports.initDB = initDB;