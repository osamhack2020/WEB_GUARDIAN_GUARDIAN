const express = require('express');
const mongoose = require('mongoose');

const PORT = 3000;
const HOST = '0.0.0.0';

// connect MongoDB
db = mongoose.createConnection('mongodb://root:GUARDIAN@0.0.0.0:27017/test', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// app
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);