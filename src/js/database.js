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
        /* CREATE TABLE "Notifications"(
            "ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
            "type"	TEXT,
            "Title"	TEXT,
            "Content"	TEXT,
            "Created_On" DATETIME DEFAULT CURRENT_TIMESTAMP,
            "StockID"	INTEGER
        )
 */
        /* CREATE TABLE "Alerts" (
	"ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"StockID"	INTEGER,
	"TargetPrice"	NUMERIC,
	"direction"	TEXT
) */
        db.run(`CREATE TABLE IF NOT EXISTS "Notifications"(
            "ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
            "Type"	TEXT,
            "Title"	TEXT,
            "Content"	TEXT,
            "StockID"	INTEGER,
            "Created_On" DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    });

    //db.close();
    return db
}


module.exports.initDB = initDB;
module.exports.conn = db;