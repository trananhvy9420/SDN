const { body, validationResult } = require("express-validator");

const registerRules = () => {
  return [
    body("membername")
      .trim()
      .notEmpty()
      .withMessage("Membername is required")
      .isLength({ min: 10 })
      .withMessage("Membername must be at least 10 characters"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 10 })
      .withMessage("Name must be at least 10 characters "),
    body("YOB")
      .notEmpty()
      .withMessage("Year of birth is required")
      .isISO8601()
      .withMessage("YOB must be a valid date in YYYY-MM-DD format")
      .toDate(),
  ];
};
const loginRules = () => {
  return [
    body("membername").trim().notEmpty().withMessage("Membername is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({ errors: extractedErrors });
};

module.exports = {
  validate,
  loginRules,
  registerRules,
};
