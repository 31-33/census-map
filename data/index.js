const sqlite3 = require('sqlite3').verbose();
const csv = require('fast-csv');
const fs = require('fs');

const db = new sqlite3.Database('./census2013.db', err => {
    if(err) return console.log(`Error: ${err}`);
    console.log('Initialized SQlite database');
});

fs.createReadStream('regional-council-2013.csv')
    .pipe(csv())
    .on("data", data => {
        db.run(
            'INSERT INTO region_coordinates (wkt, name, id) VALUES (?, ?, ?)',
            [data[0], data[2], data[1]]
        )
    })
    .on("end", () => {
        console.log("Finished processing regions.")
    });

fs.createReadStream('meshblock-2013.csv')
    .pipe(csv())
    .on("data", data => {
        db.run(
            'INSERT INTO meshblock_coordinates (wkt, name, id, area_id, region_id) VALUES (?, ?, ?, ?, ?)',
            [data[0], data[1], data[2], data[3], data[16]]
        );
    })
    .on("end", () => {
        console.log("Finished processing meshblocks.");
    });

fs.createReadStream('area-unit-2013.csv')
    .pipe(csv())
    .on("data", data => {
        db.all(
            'SELECT region_id FROM meshblock_coordinates WHERE area_id = ? LIMIT 1', 
            data[1],
            (err, res) => {
                if(res[0]){
                    db.run(
                        'INSERT INTO area_coordinates (wkt, name, id, region_id) VALUES (?, ?, ?, ?)',
                        [data[0], data[2], data[1], res[0].region_id]
                    );
                }
            }
        );
    })
    .on("end", () => {
        console.log("Finished processing areas.");
    });



