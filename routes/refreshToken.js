const router = require("express").Router();
const createError = require("http-errors");
const User = require("../models/Users");
const { accessTokenGen, refreshTokenGen } = require("../helpers/tokenConsts");

router.post("/", async (req, res) => {
  try {
    const refreshToken = req.body.refresh;
    let refPayload = refreshTokenGen.verify(refreshToken);
    console.log(refPayload);
    let foundUser = await User.findById(refPayload._id, {
      refCount: 1,
      email: 1,
    });
    if (
      foundUser &&
      foundUser.refCount === refPayload.refCount &&
      foundUser._id == refPayload._id
    ) {
      console.log("GETTING NEW ACCESS TOKEN");
      try {
        let newAccessToken = accessTokenGen.sign(
          {
            _id: refPayload._id,
            email: foundUser.email,
          },
          {
            issuer: "data vault",
          }
        );
        res.set({ "X-ACCESS-TOKEN": "Bearer " + newAccessToken });
        return res.status(200).send({ msg: "Regenerated" });
      } catch {
        console.log("Refresh TOken exprie");
        return res.status(403).send({ msg: "Please Login" });
      }
    } else {
      return res.status(403).send({ msg: "Please Login" });
    }
  } catch (error) {
    console.log(error);
    // referesh token has either expired or is invalid
    return res.status(403).send({ msg: "Please Login" });
  }
});

module.exports = router;
