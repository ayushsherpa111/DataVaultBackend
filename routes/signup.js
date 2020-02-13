const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/Users");
const createError = require("http-errors");
const {
  sendConfirmation,
  generateMessageBody,
  hashUserPass
} = require("../helpers/helper");

router.post(
  "/",
  [
    body("email", "This email is invalid").isEmail(),
    body("email").custom(async value => {
      let found = await User.findOne({
        email: value
      });
      if (found == null) {
        return Promise.resolve();
      }
      return Promise.reject(`Email already exists ${value}`);
    }),
    body("email").escape(),
    body("salt").notEmpty(),
    body("salt").escape(),
    body("masterPassword", "Password is required").notEmpty(),
    body("masterPassword").escape()
  ],
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const errMessages = error.errors.map(val => {
        return {
          message: val.msg,
          param: val.param
        };
      });
      return next(createError(400, { message: errMessages }));
    } else {
      // save user Info to DB
      hashUserPass(req.body.masterPassword, req.body.salt, (err, hash) => {
        if (!err) {
          let newUser = User({
            email: req.body.email,
            masterPassword: hash,
            salt: req.body.salt
          });
          newUser.save().then(doc => {
            generateMessageBody(req.body.email).then(email => {
              sendConfirmation(req.body.email, email)
                .then(info => {
                  res.send(
                    "Please check your email to finish the setup" +
                      info.messageId
                  );
                })
                .catch(e => {
                  console.log("ERROR", e);
                  next(createError(400, "Email doesnot exist"));
                });
            });
          });
        }
      });
    }
  }
);

router.get("/", (req, res) => {
  User.findByEmail(req.query["user"]).then(user => {
    let buff = user.masterPassword;
    res.send(buff.toString("hex"));
  });
});

module.exports = router;
