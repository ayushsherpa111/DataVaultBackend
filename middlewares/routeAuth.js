const createError = require("http-errors");
const { accessTokenGen, refreshTokenGen } = require("../helpers/tokenConsts");
const User = require("../models/Users");

async function tokenValidRefresh(req, res, next) {
  let accessToken = req.get("X-ACCESS-TOKEN")
    ? req.get("X-ACCESS-TOKEN").split(" ")[1]
    : undefined;
  if (accessToken && accessToken != "") {
    try {
      let payload = accessTokenGen.verify(accessToken, {
        issuer: "data vault",
      });
      req.payload = payload;
      return next();
    } catch {
      // token is either invalid or has expired
      console.log("ACCESS TOKEN INVALID");
    }
  }
  return next(createError(401, "Access Token Expired"));
}

module.exports = {
  tokenValidRefresh,
};
