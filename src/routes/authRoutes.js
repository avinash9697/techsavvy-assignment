const express = require("express");
const loginUser = require("../controllers/authController");
const { loginValidationRules } = require("../validators/userValidator");

const router = express.Router();

router.post("/", loginValidationRules, loginUser);

module.exports = router;
