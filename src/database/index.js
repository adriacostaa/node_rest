const mongoose = require('mongoose');

try {
     mongoose.connect('mongodb://localhost/nodeapi', { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true});
  } catch (error) {
    handleError(error);
  }

mongoose.Promise = global.Promise;

module.exports = mongoose; 