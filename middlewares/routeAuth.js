const jwt = require("jsonwebtoken");
const createError = require("http-errors");

let restrictedAccess = async (req, _, next) => {
  let sentToken = req.get("X-ACCESS-TOKEN");
  if (sentToken != undefined || sentToken != null) {
    let token = sentToken.split(" ")[1];
    try {
      const payload = await jwt.verify(token, process.env.JWT_SECRET);
      if (payload) {
        req.payload = payload;
        next();
      } else {
        next(createError(400, "INVALID TOKEN"));
      }
    } catch {
      next(createError(418, "Something went wrong with the token"));
    }
  } else {
    next(createError(403, "Token Unavailable"));
  }
};

async function generateAccessToken(req, res, next) {
  let cookie = req.cookies;
  if (cookie.jid) {
    let payload = await jwt.verify(cookie.jid, process.env.REFRESH_TOKEN);
    if (payload) {
      req.user = payload;
      next();
    }
  } else {
    next(createError(401, "Please login again"));
  }
}

module.exports = {
  restrictedAccess,
  generateAccessToken
};
