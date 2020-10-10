const assert = require('assert');
const mongodb = require('mongodb');

function client(uri, options) {
    return new mongodb
        .MongoClient(uri, Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, options))
        .connect();
}

function bucket(client, options = {}) {
    return Promise.resolve(new mongodb.GridFSBucket(client.db(), options));
}

function write(bucket, filename, metadata = {}) {
    return Promise.resolve(bucket.openUploadStream(filename, {
        metadata: metadata,
        disableMD5: true
    }));
}

function writeWithId(bucket, id, filename, metadata = {}) {
    return Promise.resolve(bucket.openUploadStreamWithId(id, filename, {
        metadata: metadata,
        disableMD5: true
    }));
}

function streamById(bucket, id, options = { start: 0, end: 0 }) {
    return new Promise((resolve, reject) => {
        try {
            let _id = new mongodb.ObjectId(id);
            resolve(bucket.openDownloadStream(_id, {
                start: options.start || 0,
                end: options.end || 0
            }));
        }
        catch(err) {
            reject(err);
        }
    });
}

function removeById(bucket, id) {
    return new Promise((resolve, reject) => {
        id = new mongodb.ObjectId(id);
        bucket.delete(id, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve(`File ${id} is deleted`);
            }
        });
    });
}

function findById(bucket, id) {
    return new Promise((resolve, reject) => {
        try {
            let _id = new mongodb.ObjectId(id);
            resolve(bucket.find({ _id: _id })
            .toArray());
        }
        catch(err) {
            reject(err);
        }
    });
}

function list(bucket) {
    return bucket.find().toArray();
}

class GFSBucket {

    constructor(uri, options) {
        client(uri, options)
        .then(_client => this._client = _client)
        .then(bucket)
        .then(_bucket => this._bucket = _bucket)
        .catch(err => assert.ifError(err));

        this._express_endpoints = {
            create: (req, res) => {
                let id = new mongodb.ObjectId();
                this.writeWithId(id, req.headers['filename'], {
                    contentType: req.headers['content-type']
                })
                .then(stream => {
                    req.pipe(stream);
                    stream.on('error', err => {
                        res.status(400).json(err);
                    })
                    .on('finish', () => {
                        this.findById(id)
                        .then(docs => {
                            res.status(200).json(docs[0]);
                        })
                        .catch(err => {
                            res.status(400).json(err);
                        })
                    });
                })
                .catch(err => {
                    res.status(400).json(err);
                });
            },
            streamById: (req, res) => {
                this.findById(req.params.id)
                .then(docs => {
                    if (docs[0]) {
                        this.streamById(docs[0]._id)
                        .then(stream => stream.pipe(res))
                        .catch(err => {
                            res.status(400).json(err);
                        });
                    }
                    else {
                        res.status(404).json({
                            message: 'Not Found'
                        })
                    }
                })
                .catch(err => {
                    res.status(400).json({
                        message: err.message
                    });
                });
            },
            removeById: (req, res) => {
                this.findById(req.params.id)
                .then(docs => {
                    if (docs[0]) {
                        this.removeById(docs[0]._id)
                        .then(message => {
                            res.status(200).json(docs[0]);
                        })
                        .catch(err => {
                            res.status(400).json(err);
                        });
                    }
                    else {
                        res.status(404).json({
                            message: 'Not Found'
                        })
                    }
                })
                .catch(err => {
                    res.status(400).json(err);
                });
            },
            list: (req, res) => {
                this.list()
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    res.status(400).json(err);
                });
            }
        }
    }

    getExpressEndpoints() {
        return this._express_endpoints;
    }

    write(filename, metadata = {}) {
        return write(this._bucket, filename, metadata);
    }

    writeWithId(id, filename, metadata = {}) {
        return writeWithId(this._bucket, id, filename, metadata);
    }

    streamById(id, options = { start: 0, end: 0 }) {
        return streamById(this._bucket, id, options);
    }

    removeById(id) {
        return removeById(this._bucket, id);
    }

    findById(id) {
        return findById(this._bucket, id);
    }

    list() {
        return list(this._bucket);
    }
}

module.exports.client = client;
module.exports.bucket = bucket;
module.exports.write = write;
module.exports.writeWithId = writeWithId;
module.exports.streamById = streamById;
module.exports.removeById = removeById;
module.exports.findById = findById;
module.exports.list = list;
module.exports.GFSBucket = GFSBucket;