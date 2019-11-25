const router = require("express").Router();

router.get("/", (req, res) => {
  console.log(req.cookies);
  console.log(req.signedCookies);
  res.send("IMPORTANT")
});

module.exports = router;
