const { TokenGenerator } = require("../middlewares/validation");
let refreshTokenGen = new TokenGenerator(
  process.env.REFRESH_TOKEN,
  process.env.REFRESH_TOKEN,
  {
    algorithm: "HS512",
    expiresIn: "1w",
    // uncomment in prod
    // notBefore: "15min" 
  }
);
let accessTokenGen = new TokenGenerator(
  process.env.JWT_SECRET,
  process.env.JWT_SECRET,
  {
    algorithm: "HS256",
    expiresIn: "15min"
  }
);

module.exports = {
  refreshTokenGen,
  accessTokenGen
};
