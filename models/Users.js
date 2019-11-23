const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  masterPassword: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", userSchema);
