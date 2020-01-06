const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodeapi', { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true,});


mongoose.Promise = global.Promise;

module.exports = mongoose;