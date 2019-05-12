var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var bz2 = require('unbzip2-stream');

const PORT = process.env.PORT || 3000;

fs.createReadStream('./data/census2013.db.bz2')
    .pipe(bz2())
    .pipe(fs.createWriteStream('./data/census2013.db'));

const db = new sqlite3.Database(`./data/census2013.db`, sqlite3.OPEN_READONLY, err => {
    if(err) return console.log(`Error: ${err}`);
    console.log('Initialized SQlite database');
});

var server = express();

server.use('', express.static(`${__dirname}/client`));

server.get('/regions', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM region_coordinates", 
        (err, regions) => res.send(regions)
    );
});

server.get('/areas/:region_id', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM area_coordinates WHERE region_id = ?",
        req.params.region_id,
        (err, areas) => res.send(areas)
    );
});

server.get('/meshblocks/:area_id', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM meshblock_coordinates WHERE area_id = ?",
        req.params.area_id,
        (err, meshblocks) => res.send(meshblocks)
    );
});

server.listen(PORT);
