const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('stocksDB');


function initDB() {

    db.serialize(function () {

        db.run(`CREATE TABLE IF NOT EXISTS "Stocks"(
            "ID"	INTEGER,
            "StockName"	TEXT,
            "Index"	TEXT,
            "High"	NUMERIC,
            "Low"	NUMERIC,
            "Currency"	TEXT,
            PRIMARY KEY("ID")
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS "Notifications" (
            "ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
            "Type"	TEXT,
            "Title"	TEXT,
            "Content"	TEXT,
            "StockID"	INTEGER,
            "Created_On"	DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS "Alerts" (
            "ID"	INTEGER PRIMARY KEY AUTOINCREMENT,
            "StockID"	INTEGER,
            "TargetPrice"	NUMERIC,
            "direction"	TEXT,
            "Auto_Renew"	INTEGER,
            "frequency"	NUMERIC NOT NULL
        )`);

    });
    return db
}
initDB();

module.exports.initDB = initDB;
module.exports.conn = db;