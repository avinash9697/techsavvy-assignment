const { body } = require("express-validator");

userValidationRules = [
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Username is required must be at least 3 characters"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .isEmail()
    .withMessage("Valid email is required"),
];

updateValidationRules = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
];

loginValidationRules = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
module.exports = {
  userValidationRules,
  updateValidationRules,
  loginValidationRules,
};
