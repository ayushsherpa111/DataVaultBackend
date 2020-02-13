const mongoose = require("mongoose");
const passSchema = mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: false
  },
  email: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = passSchema
