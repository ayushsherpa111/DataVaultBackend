const router = require("express").Router();
// const createError = require("http-errors");
const { TokenGenerator } = require("../middlewares/validation");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const { tokenValidRefresh } = require("../middlewares/routeAuth");

let genToken = new TokenGenerator(
  process.env.JWT_SECRET,
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "15m" }
);

router.use(tokenValidRefresh);

router.post("/someContent", (req, res) => {
  if (req.newToken) {
    console.log(req.newToken);
    res.send({
      msg: "ACCESS GRANTED. SENDING VAULT NEW TOKEN GENERATED",
      newToken: req.newToken,
    });
  } else {
    res.send({
      msg: "ACCESS GRANTED. SENDING VAULT",
      payload: req.payload,
    });
  }
});

router.post("/test", (req, res) => {
  res.set({ FOo: "BAR" });
  console.log(req.payload);
  res.send({ msg: "Success", rec: req.body });
});

router.post("/store", async (req, res) => {
  if (req.payload) {
    try {
      const currentUser = await User.findById(req.payload._id);
      // currentUser.vault = req.body;
      console.log(req.body);
      for (let i of req.body) {
        console.log(i.id);
        const cur = currentUser.vault.findIndex((e) => {
          console.log(e.id == i.id);
          return e.id === i.id;
        });
        console.log(cur);
        if (cur > -1) {
          console.log("FOUND");
          currentUser.vault[cur] = i;
        } else {
          currentUser.vault.push(i);
        }
      }
      currentUser.save().then((e) => {
        console.log("Done saving ");
        res.status(200).send(currentUser);
      });
    } catch (e) {
      res.status(400).send("BRUH");
    }
  } else {
    res.status(400).send({ err: "Refreshed" });
  }
});

router.post("/update", async (req, res) => {});

router.post("/test", async (req, res) => {
  try {
    res.send(jwt.decode(req.body.token));
  } catch {
    res.send("OOPS");
  }
});

router.post("/refresh", async (req, res) => {
  try {
    let token = req.body.token;
    let newTok = genToken.refresh(token, {
      verify: {
        audience: "Smort Peopel",
        jwtid: "1",
      },
      jwtid: "2",
    });
    console.log(newTok);
    let dc1 = jwt.decode(token);
    let dc2 = jwt.decode(newTok);
    res.send({
      dc1,
      dc2,
    });
  } catch (e) {
    console.log("newTok");
    res.send(e);
  }
});

module.exports = router;
