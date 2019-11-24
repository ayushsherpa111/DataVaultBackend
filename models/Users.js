const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  masterPassword: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default:false
  }
});

module.exports = mongoose.model("User", userSchema);
