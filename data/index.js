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

function createDataTables(){
    db.run(`CREATE TABLE "region_data" (
        "id"	INTEGER NOT NULL,
        "name"	TEXT NOT NULL,
        "usual_resident_male"	INTEGER,
        "usual_resident_female"	INTEGER,
        "usual_resident_0_4"	INTEGER,
        "usual_resident_5_9"	INTEGER,
        "usual_resident_10_14"	INTEGER,
        "usual_resident_15_19"	INTEGER,
        "usual_resident_20_24"	INTEGER,
        "usual_resident_25_29"	INTEGER,
        "usual_resident_30_34"	INTEGER,
        "usual_resident_35_39"	INTEGER,
        "usual_resident_40_44"	INTEGER,
        "usual_resident_45_49"	INTEGER,
        "usual_resident_50_54"	INTEGER,
        "usual_resident_55_60"	INTEGER,
        "usual_resident_60_64"	INTEGER,
        "usual_resident_65_over"	INTEGER,
        "language_english"	INTEGER,
        "language_maori"	INTEGER,
        "language_samoan"	INTEGER,
        "language_nz_sign"	INTEGER,
        "language_other"	INTEGER,
        "language_none"	INTEGER,
        "language_total_responses"	INTEGER,
        "total_income_under_5000"	INTEGER,
        "total_income_5000_10000"	INTEGER,
        "total_income_10000_20000"	INTEGER,
        "total_income_20000_30000"	INTEGER,
        "total_income_30000_50000"	INTEGER,
        "total_income_50000_more"	INTEGER,
        "weekly_rent_under_100"	INTEGER,
        "weekly_rent_100_149"	INTEGER,
        "weekly_rent_150_199"	INTEGER,
        "weekly_rent_200_249"	INTEGER,
        "weekly_rent_250_299"	INTEGER,
        "weekly_rent_300_349"	INTEGER,
        "weekly_rent_350_over"	INTEGER,
        "dwelling_owned_or_partly_owned"	INTEGER,
        "dwelling_not_owned"	INTEGER,
        "dwelling_held_in_family_trust"	INTEGER,
        "dwelling_rented"	INTEGER,
        PRIMARY KEY("id")
    )`);
    db.run(`CREATE TABLE "area_data" (
        "id"	INTEGER NOT NULL,
        "name"	TEXT,
        "region_name" TEXT,
        "usual_resident_male"	INTEGER,
        "usual_resident_female"	INTEGER,
        "usual_resident_0_4"	INTEGER,
        "usual_resident_5_9"	INTEGER,
        "usual_resident_10_14"	INTEGER,
        "usual_resident_15_19"	INTEGER,
        "usual_resident_20_24"	INTEGER,
        "usual_resident_25_29"	INTEGER,
        "usual_resident_30_34"	INTEGER,
        "usual_resident_35_39"	INTEGER,
        "usual_resident_40_44"	INTEGER,
        "usual_resident_45_49"	INTEGER,
        "usual_resident_50_54"	INTEGER,
        "usual_resident_55_60"	INTEGER,
        "usual_resident_60_64"	INTEGER,
        "usual_resident_65_over"	INTEGER,
        "language_english"	INTEGER,
        "language_maori"	INTEGER,
        "language_samoan"	INTEGER,
        "language_nz_sign"	INTEGER,
        "language_other"	INTEGER,
        "language_none"	INTEGER,
        "language_total_responses"	INTEGER,
        "total_income_under_5000"	INTEGER,
        "total_income_5000_10000"	INTEGER,
        "total_income_10000_20000"	INTEGER,
        "total_income_20000_30000"	INTEGER,
        "total_income_30000_50000"	INTEGER,
        "total_income_50000_more"	INTEGER,
        "weekly_rent_under_100"	INTEGER,
        "weekly_rent_100_149"	INTEGER,
        "weekly_rent_150_199"	INTEGER,
        "weekly_rent_200_249"	INTEGER,
        "weekly_rent_250_299"	INTEGER,
        "weekly_rent_300_349"	INTEGER,
        "weekly_rent_350_over"	INTEGER,
        "dwelling_owned_or_partly_owned"	INTEGER,
        "dwelling_not_owned"	INTEGER,
        "dwelling_held_in_family_trust"	INTEGER,
        "dwelling_rented"	INTEGER,
        PRIMARY KEY("id")
    )`);
    db.run(`CREATE TABLE "meshblock_data" (
        "id"	INTEGER NOT NULL,
        "name"	TEXT,
        "area_name" TEXT,
        "region_name" TEXT,
        "usual_resident_male"	INTEGER,
        "usual_resident_female"	INTEGER,
        "usual_resident_0_4"	INTEGER,
        "usual_resident_5_9"	INTEGER,
        "usual_resident_10_14"	INTEGER,
        "usual_resident_15_19"	INTEGER,
        "usual_resident_20_24"	INTEGER,
        "usual_resident_25_29"	INTEGER,
        "usual_resident_30_34"	INTEGER,
        "usual_resident_35_39"	INTEGER,
        "usual_resident_40_44"	INTEGER,
        "usual_resident_45_49"	INTEGER,
        "usual_resident_50_54"	INTEGER,
        "usual_resident_55_60"	INTEGER,
        "usual_resident_60_64"	INTEGER,
        "usual_resident_65_over"	INTEGER,
        "language_english"	INTEGER,
        "language_maori"	INTEGER,
        "language_samoan"	INTEGER,
        "language_nz_sign"	INTEGER,
        "language_other"	INTEGER,
        "language_none"	INTEGER,
        "language_total_responses"	INTEGER,
        "total_income_under_5000"	INTEGER,
        "total_income_5000_10000"	INTEGER,
        "total_income_10000_20000"	INTEGER,
        "total_income_20000_30000"	INTEGER,
        "total_income_30000_50000"	INTEGER,
        "total_income_50000_more"	INTEGER,
        "weekly_rent_under_100"	INTEGER,
        "weekly_rent_100_149"	INTEGER,
        "weekly_rent_150_199"	INTEGER,
        "weekly_rent_200_249"	INTEGER,
        "weekly_rent_250_299"	INTEGER,
        "weekly_rent_300_349"	INTEGER,
        "weekly_rent_350_over"	INTEGER,
        "dwelling_owned_or_partly_owned"	INTEGER,
        "dwelling_not_owned"	INTEGER,
        "dwelling_held_in_family_trust"	INTEGER,
        "dwelling_rented"	INTEGER,
        PRIMARY KEY("id")
    )`);
}

function replaceMissing(array, startIndex){
    array[0] = parseInt(array[0], 10);
    for(var i = startIndex; i < array.length; i++){
        if(array[i] === '..C' || array[i] === '*' || array[i] === '..' || array ===  ''){
            array[i] = 0
        }
    }
    return array;
}

function loadRegionData(filename){
    fs.createReadStream(filename)
    .pipe(csv())
    .on("data", data => {
        db.run(
            `INSERT INTO region_data (id, name, usual_resident_male, usual_resident_female, usual_resident_0_4, usual_resident_5_9, usual_resident_10_14, usual_resident_15_19, usual_resident_20_24, usual_resident_25_29, usual_resident_30_34, usual_resident_35_39, usual_resident_40_44, usual_resident_45_49, usual_resident_50_54, usual_resident_55_60, usual_resident_60_64, usual_resident_65_over, language_english, language_maori, language_samoan, language_nz_sign, language_other, language_none, language_total_responses, total_income_under_5000, total_income_5000_10000, total_income_10000_20000, total_income_20000_30000, total_income_30000_50000, total_income_50000_more, weekly_rent_under_100, weekly_rent_100_149, weekly_rent_150_199, weekly_rent_200_249, weekly_rent_250_299, weekly_rent_300_349, weekly_rent_350_over, dwelling_owned_or_partly_owned, dwelling_not_owned, dwelling_held_in_family_trust, dwelling_rented) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [data[3], data[0], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15], data[16], data[17], data[18], data[19], data[20], data[21], data[22], data[23], data[24], data[25], data[26], data[27], data[28], data[29], data[30], data[31], data[32], data[33], data[34], data[35], data[36], data[37], data[38], data[39], data[40], data[41], data[42], data[43]]
        );
    })
    .on("error", (err) => console.log(err))
    .on("end", () => {
        console.log("Finished processing regions.")
    })
}
function loadAreaData(filename){
    fs.createReadStream(filename)
    .pipe(csv())
    .on("data", data => {
        db.run(
            `INSERT INTO area_data 
                (id, name, region_name, usual_resident_male, usual_resident_female, usual_resident_0_4, usual_resident_5_9, usual_resident_10_14, usual_resident_15_19, usual_resident_20_24, usual_resident_25_29, usual_resident_30_34, usual_resident_35_39, usual_resident_40_44, usual_resident_45_49, usual_resident_50_54, usual_resident_55_60, usual_resident_60_64, usual_resident_65_over, language_english, language_maori, language_samoan, language_nz_sign, language_other, language_none, language_total_responses, total_income_under_5000, total_income_5000_10000, total_income_10000_20000, total_income_20000_30000, total_income_30000_50000, total_income_50000_more, weekly_rent_under_100, weekly_rent_100_149, weekly_rent_150_199, weekly_rent_200_249, weekly_rent_250_299, weekly_rent_300_349, weekly_rent_350_over, dwelling_owned_or_partly_owned, dwelling_not_owned, dwelling_held_in_family_trust, dwelling_rented)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            replaceMissing([data[3], data[0], data[2], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15], data[16], data[17], data[18], data[19], data[20], data[21], data[22], data[23], data[24], data[25], data[26], data[27], data[28], data[29], data[30], data[31], data[32], data[33], data[34], data[35], data[36], data[37], data[38], data[39], data[40], data[41], data[42], data[43]], 3)
        )
    })
    .on("end", () => {
        console.log("Finished processing areas.")
    });
}

function loadMeshblockData(filename){
    fs.createReadStream(filename)
    .pipe(csv())
    .on("data", data => {
        db.run(
            `INSERT INTO meshblock_data 
                (id, name, area_name, region_name, usual_resident_male, usual_resident_female, usual_resident_0_4, usual_resident_5_9, usual_resident_10_14, usual_resident_15_19, usual_resident_20_24, usual_resident_25_29, usual_resident_30_34, usual_resident_35_39, usual_resident_40_44, usual_resident_45_49, usual_resident_50_54, usual_resident_55_60, usual_resident_60_64, usual_resident_65_over, language_english, language_maori, language_samoan, language_nz_sign, language_other, language_none, language_total_responses, total_income_under_5000, total_income_5000_10000, total_income_10000_20000, total_income_20000_30000, total_income_30000_50000, total_income_50000_more, weekly_rent_under_100, weekly_rent_100_149, weekly_rent_150_199, weekly_rent_200_249, weekly_rent_250_299, weekly_rent_300_349, weekly_rent_350_over, dwelling_owned_or_partly_owned, dwelling_not_owned, dwelling_held_in_family_trust, dwelling_rented)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            replaceMissing([data[3], data[0], data[1], data[2], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15], data[16], data[17], data[18], data[19], data[20], data[21], data[22], data[23], data[24], data[25], data[26], data[27], data[28], data[29], data[30], data[31], data[32], data[33], data[34], data[35], data[36], data[37], data[38], data[39], data[40], data[41], data[42], data[43]], 4)
        )
    })
    .on("end", () => {
        console.log("Finished processing meshblocks.")
    });
}



// createTables();
// loadRegions('regional-council-2013.csv');
// loadMeshblocks('meshblock-2013.csv');
// loadAreas('area-unit-2013.csv');

// createDataTables();
// loadRegionData(`region-census-2013-data.csv`);
// loadAreaData(`area-census-2013-data.csv`);
// loadMeshblockData(`meshblock-census-2013-data.csv`);