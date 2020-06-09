const passSchema = require("./PasswordSchema");
const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  salt: {
    type: Buffer,
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
  refCount: {
    type: Number,
    default: 0
  },
  hint: {
    type: String,
    required: false
  },
  vault: [passSchema]
});

userSchema.methods.toJSON = function() {
  let user = this;
  let userObj = user.toObject();
  delete userObj["masterPassword"];
  delete user["salt"];
  delete user["confirmed"];
  return userObj;
};

userSchema.statics.findByEmail = function(email) {
  let user = this;
  return user.findOne({
    email
  });
};
const userModel = mongoose.model("User", userSchema);
userModel.createIndexes({ email: 1 }, err => {
  if (!err) console.log("Index on email created");
});

module.exports = userModel;
