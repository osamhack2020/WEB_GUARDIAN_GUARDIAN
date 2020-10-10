const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs')
const Grid = require('gridfs-stream');
const app = express();

const PORT = 3000;
const HOST = '0.0.0.0';

var db_filename = "logo.png";
var local_file = "./logo128.png";

// connect MongoDB
var db = mongoose.createConnection('mongodb://mongo-compose:27017/test', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
});

db.on('error', console.error);
db.once('open', function(){
  // CONNECTED TO MONGODB SERVER
  console.log("Connected to mongod server");

  var gfs = Grid(db.db, mongoose.mongo);

  app.get('/', function (req, res) {
    res.send('Hello World!');
  });

  // Writing a file from local to MongoDB
  app.get('/write', function (req, res) {
    var writestream = gfs.createWriteStream({ filename: db_filename });
    fs.createReadStream(local_file).pipe(writestream);
    writestream.on('close', function (file) {
        res.send('File Created : ' + file.filename);
    });
  });

  // server open
  app.listen(PORT, HOST);
  console.log(`Running on http://${HOST}:${PORT}`);
});