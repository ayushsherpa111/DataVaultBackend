let emailValidation = (req, res, next) => {
  const emailRegex = /^[a-zA-Z0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/gm;
  if (emailRegex.test(req.body.email)) {
    next();
  } else {
    next('route');
  }
};

module.exports = {
  emailValidation
};
