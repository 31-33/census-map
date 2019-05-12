const sqlite3 = require('sqlite3').verbose();
const csv = require('fast-csv');
const fs = require('fs');

function formatCoordinates(wkt){
    return wkt.replace(
        new RegExp('([0-9]+\.)([0-9]+)', 'g'),
        (match, m1, m2) => {
            return m1 + (m2.length > 5 ? m2.substring(0, 5) : m2);
        }
    );
}

const db = new sqlite3.Database('./census2013.db', err => {
    if(err) return console.log(`Error: ${err}`);
    console.log('Initialized SQlite database');
});

function createTables(){
    db.run(`CREATE TABLE "region_coordinates" (
	"wkt"	BLOB NOT NULL,
	"name"	TEXT NOT NULL,
	"id"	INTEGER NOT NULL
    );`);

    db.run(`CREATE TABLE "area_coordinates" (
        "wkt"	BLOB NOT NULL,
        "name"	TEXT NOT NULL,
        "id"	INTEGER NOT NULL,
        "region_id"	INTEGER NOT NULL
    );`);

    db.run(`CREATE TABLE "meshblock_coordinates" (
        "wkt"	TEXT NOT NULL,
        "name"	INTEGER NOT NULL,
        "id"	INTEGER NOT NULL,
        "area_id"	INTEGER NOT NULL,
        "region_id"	INTEGER NOT NULL
    );`);
}

function loadRegions(filename){
    fs.createReadStream(filename)
    .pipe(csv())
    .on("data", data => {
        db.run(
            'INSERT INTO region_coordinates (wkt, name, id) VALUES (?, ?, ?)',
            [formatCoordinates(data[0]), data[2], data[1]]
        )
    })
    .on("end", () => {
        console.log("Finished processing regions.")
    });
}

function loadMeshblocks(filename){
    fs.createReadStream(filename)
        .pipe(csv())
        .on("data", data => {
            db.run(
                'INSERT INTO meshblock_coordinates (wkt, name, id, area_id, region_id) VALUES (?, ?, ?, ?, ?)',
                [formatCoordinates(data[0]), data[1], data[2], data[3], data[16]]
            );
        })
        .on("end", () => {
            console.log("Finished processing meshblocks.");
        });
}

function loadAreas(filename){
    fs.createReadStream(filename)
        .pipe(csv())
        .on("data", data => {
            db.all(
                'SELECT region_id FROM meshblock_coordinates WHERE area_id = ? LIMIT 1', 
                data[1],
                (err, res) => {
                    if(res[0]){
                        db.run(
                            'INSERT INTO area_coordinates (wkt, name, id, region_id) VALUES (?, ?, ?, ?)',
                            [formatCoordinates(data[0]), data[2], data[1], res[0].region_id]
                        );
                    }
                    else console.log(`No region_id found for area: ${data[2]}`);
                }
            );
        })
        .on("end", () => {
            console.log("Finished processing areas.");
        });
}

// createTables();
// loadRegions('regional-council-2013.csv');
// loadMeshblocks('meshblock-2013.csv');
// loadAreas('area-unit-2013.csv');