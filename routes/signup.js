const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/Users");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { Worker } = require("worker_threads");
const {
  sendConfirmation,
  generateMessageBody,
  _encrypt,
  _decrypt,
  validateToken
} = require("../helpers/helper");
const { randomBytes } = require("crypto");

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
      const worker = new Worker("./helpers/hashGen.js", {
        workerData: {
          pass: req.body.masterPassword,
          salt: req.body.salt
        }
      });
      worker.once("message", hash => {
        const userHash = Buffer.from(Object.values(hash));
        let newUser = User({
          email: req.body.email,
          masterPassword: userHash,
          salt: req.body.salt
        });
        newUser.save();
      });

      sendConfirmation(req.body.email, email)
        .then(info => {
          res.send("Please check your email to finish the setup");
        })
        .catch(e => {
          console.log("ERROR", e);
          next(createError(400, "Email doesnot exist"));
        });
      console.log("SAVING USER");
    }
  }
);

router.post(
  "/resend",
  [body("email").notEmpty(), body("email").escape(), body("email").isEmail()],
  (req, res) => {
    User.findByEmail(req.body.email).then(doc => {
      if (!doc.confirmed) {
        sendConfirmation(doc.email, body)
          .then(_ => {
            res.send("Please check your email");
          })
          .catch(er => {
            res.err(er);
          });
      } else {
        res.send("You can login");
      }
    });
  }
);

router.get("/activate/:token", (request, response) => {
  let token = request.params.token;
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      issuer: process.env.EMAIL,
      expiresIn: "1d"
    },
    async (err, decoded) => {
      console.log(decoded);
      if (!err) {
        await User.findOneAndUpdate(
          { email: decoded.email },
          {
            confirmed: true
          }
        );
        response.send({
          message: "Welcome"
        });
      }
    }
  );
});

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

module.exports = router;
