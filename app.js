var express = require('express');
var sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3000;

var server = express();

server.use('', express.static(`${__dirname}/client`));


server.listen(PORT);
