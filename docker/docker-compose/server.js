const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs')

const app = express();

const PORT = 3000;
const HOST = '0.0.0.0';

var db_filename = "logo.png";
var local_file = "./logo128.png";

// connect MongoDB
var db = mongoose.createConnection('mongodb://test_rw:1q2w3e4r@mongo-compose:27017/test', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
});

db.on('error', console.error);
db.once('open', function(){
  // CONNECTED TO MONGODB SERVER
  console.log("Connected to mongod server");

  var gridFSBucket = new mongoose.mongo.GridFSBucket(db.db, {
    chunkSizeBytes:1024,
    bucketName:'filesBucket'
  });

  app.get('/', function (req, res) {
    res.send('Hello World!');
  });

  // Writing a file from local to MongoDB
  app.get('/write', function (req, res) {
    var writestream = gridFSBucket.openUploadStream({ filename: db_filename });
    fs.createReadStream(local_file)
      .pipe(writestream)
      .on('error', ()=> {
        console.log("Write error occured:"+error);
        res.send(error);
      })
      .on('finish', ()=>{
        console.log("Complete uploading");
        res.send("Done uploading");
      });
  });

  // server open
  app.listen(PORT, HOST);
  console.log(`Running on http://${HOST}:${PORT}`);
});

