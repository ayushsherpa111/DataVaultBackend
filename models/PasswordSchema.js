const mongoose = require("mongoose");

const passSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: "Other",
  },
  description: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    required: true,
    default: "other.png",
  },
  iv: {
    type: String,
    required: true,
  },
  sync: {
    type: Boolean,
    default: true,
  },
});

module.exports = passSchema;
