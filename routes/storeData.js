const router = require("express").Router();
const createError = require("http-errors");
const { restrictedAccess } = require("../middlewares/routeAuth");
const { TokenGenerator } = require("../middlewares/validation");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const { accessTokenGen, refreshTokenGen } = require("../helpers/tokenConsts");

let genToken = new TokenGenerator(
  process.env.JWT_SECRET,
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "15m" }
);

router.use(async (req, _, next) => {
  let accessToken = req.get("X-ACCESS-TOKEN");
  let refresh = req.get("X-REFRESH-TOKEN");

  if (accessToken != undefined || refresh != undefined) {
    try {
      let valid = accessTokenGen.verify(accessToken.split(" ")[1], {});
      req.payload = valid;
      return next();
    } catch (e) {}
    try {
      let refPayload = refreshTokenGen.verify(refresh, {
        issuer: "data vault"
      });
      let currUser = await User.findById(refPayload._id);
      if (refPayload.refCount == currUser.refCount) {
        if (accessToken) {
          req.newToken = accessTokenGen.refresh(accessToken, {});
        } else {
          req.newToken = accessTokenGen.sign(
            {
              _id: currUser._id,
              email: currUser.email
            },
            {
              issuer: "data vault"
            }
          );
        }
        return next();
      }
    } catch (e) {
      console.log(e);
      return next(createError(401, e));
    }
    next(createError(405, "Please Login"));
    console.log("HERE");
  } else {
    next(createError(403, "ACESS TOKEN NOT DEFINED"));
  }
});

router.post("/someContent", (req, res) => {
  if (req.newToken) {
    console.log(req.newToken);
    res.send({
      msg: "ACCESS GRANTED. SENDING VAULT",
      newToken: req.newToken
    });
  } else {
    res.send({
      msg: "ACCESS GRANTED. SENDING VAULT",
      payload: req.payload
    });
  }
});

router.post("/", async (req, res) => {
  if (req.body.token) {
    res.send(jwt.decode(req.body.token));
  } else {
    let token = genToken.sign(req.body, {
      audience: "Smort Peopel",
      jwtid: "1"
    });

    res.send(token);
  }
});

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
        jwtid: "1"
      },
      jwtid: "2"
    });
    console.log(newTok);
    let dc1 = jwt.decode(token);
    let dc2 = jwt.decode(newTok);
    res.send({
      dc1,
      dc2
    });
  } catch (e) {
    console.log("newTok");
    res.send(e);
  }
});

module.exports = router;
