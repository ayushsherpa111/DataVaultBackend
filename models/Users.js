const passSchema = require("./PasswordSchema");
const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  masterPassword: {
    type: Buffer,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  vault: [passSchema]
});

userSchema.methods.toJSON = function() {
  let user = this;
  let userObj = user.toObject();
  delete userObj["masterPassword"];
  return userObj;
};

userSchema.statics.findByEmail = function(email) {
  let user = this;
  return user.findOne({
    email
  });
};

module.exports = mongoose.model("User", userSchema);
