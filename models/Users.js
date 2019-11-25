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
    default: false
  }
});

userSchema.methods.toJSON = function(next) {
  let user = this;
  let userObj = user.toObject();
  delete userObj["masterPassword"];
  return userObj;
};

module.exports = mongoose.model("User", userSchema);
