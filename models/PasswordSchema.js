const mongoose = require("mongoose");

const passSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    default: null,
  },
  username: {
    type: String,
    required: true,
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: false,
    default: null,
  },
  url: {
    type: String,
    required: false,
    default: null,
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
  hash: {
    type: String,
    required: true,
  },
});

module.exports = passSchema;
