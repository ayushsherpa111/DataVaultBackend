const router = require("express").Router();
const { body, validationResult, query } = require("express-validator");
const User = require("../models/Users");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { Worker } = require("worker_threads");
const { randomBytes } = require("crypto");
const {
  sendConfirmation,
  generateMessageBody,
  _encrypt,
  _decrypt,
  validateToken,
} = require("../helpers/helper");

router.get("/test", (req, res) => {
  res.send("sucscse");
});

router.post(
  "/",
  [
    body("email", "This email is invalid").isEmail(),
    body("email").custom(async (value) => {
      let found = await User.findOne({
        email: value,
      });
      if (found == null) {
        return Promise.resolve();
      }
      return Promise.reject(`Email already exists ${value}`);
    }),
    body("email").escape(),
    body("hint").escape(),
    body("masterPassword", "Password is required").notEmpty(),
    body("masterPassword").escape(),
  ],
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const errMessages = error.errors.map((val) => {
        return {
          message: val.msg,
          param: val.param,
        };
      });
      return next(createError(400, { message: errMessages }));
    } else {
      // save user Info to DB
      const userSalt = randomBytes(8);
      const worker = new Worker("./helpers/hashGen.js", {
        workerData: {
          pass: req.body.masterPassword,
          salt: userSalt,
        },
      });
      worker.once("message", (hash) => {
        console.log();
        let newUser = User({
          email: req.body.email,
          masterPassword: Buffer.from(hash),
          salt: userSalt,
        });
        console.log(newUser);
        if (req.body.hint) {
          newUser.hint = req.body.hint;
        }
        newUser.save();
      });

      sendConfirmation(req.body.email)
        .then((_) => {
          res.send({
            status: 200,
            msg: "Please check your email to finish the setup",
          });
        })
        .catch((e) => {
          console.log("ERROR", e);
          next(createError(400, "Email doesnot exist"));
        });
    }
  }
);

router.post(
  "/resend",
  [body("email").notEmpty(), body("email").escape(), body("email").isEmail()],
  (req, res) => {
    let errors = validationResult(req);
    console.log(req.body);
    if (errors.isEmpty()) {
      User.findByEmail(req.body.email)
        .then((doc) => {
          console.log(doc);
          if (!doc.confirmed) {
            sendConfirmation(doc.email)
              .then((_) => {
                res.send({ stat: 200, msg: "Please check your email" });
              })
              .catch((er) => {
                res.err(er);
              });
          } else {
            res.send({ stat: 200, msg: "You can login" });
          }
        })
        .catch((e) => {
          res.send("User not found");
        });
    } else {
      res.send(createError(400, { err: "ERR" }));
    }
  }
);

router.post(
  "/activate",
  [body("token").notEmpty(), body("token").escape()],
  (req, res) => {
    if (validationResult(req).isEmpty()) {
      let token = req.body.token;
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          issuer: "data vault",
        },
        async (err, decoded) => {
          console.log(err);
          if (!err) {
            try {
              await User.findOneAndUpdate(
                { email: decoded.email },
                {
                  confirmed: true,
                }
              );
              res.send({
                message: "Welcome",
              });
            } catch {
              res.send(createError(400, { err: "Token Error" }));
            }
          }
        }
      );
    } else {
      res.send(createError(400, { err: "Invalid Token" }));
    }
  }
);

router.get(
  "/check",
  [
    query("email").isEmail(),
    query("email").escape(),
    query("email").custom(async (e) => {
      return (await User.findByEmail(e)) === null
        ? Promise.resolve(null)
        : Promise.reject("Email already taken");
    }),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (errors.isEmpty()) {
      res.send({ msg: "valid" });
    } else {
      res.send({ err: errors.errors[0].msg });
    }
  }
);

router.post("/bruh", (req, res) => {
  User.findByEmail(req.body.email).then((user) => {
    let copy = Object.assign({}, user);
    res.send({ mp: Buffer.from(copy._doc.masterPassword).toString(16) });
  });
});

/*
router.get("/", (req, res) => {
  User.findByEmail(req.query["user"]).then(user => {
    let iv = randomBytes(16);
    console.log(iv);
    res.cookie("iv", iv);
    res.send({
      enc: _encrypt(user.email, "aes-256-cbc", user.masterPassword, iv),
      iv
    });
  });
});

router.post("/dec", async (req, res) => {
  User.findByEmail(req.body.email).then(doc => {
    // console.log(Buffer.from(doc.masterPassword));
    res.send(
      _decrypt(
        req.body.payload,
        "aes-256-cbc",
        Buffer.from(doc.masterPassword),
        Buffer.from(req.cookies.iv.data)
      )
    );
  });
});
*/
module.exports = router;
