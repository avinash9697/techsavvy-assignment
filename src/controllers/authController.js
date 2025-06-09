const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../logger");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;
const loginUser = async (req, res, next) => {
  try {
    logger.info("Login Attempted");
    //checking for any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation error happend");
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    //checking for user in database
    const user = await User.findOne({ where: { username } });

    if (!user) {
      logger.warn("login failed, user not found");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    //checking whether passwords are matching
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`login failed, password is incorrect from ${username}`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    //creating jwt token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    logger.info(`login successful from ${username}`);
    res.json({ message: "Login Succesful", token });
  } catch (error) {
    next(error);
  }
};

module.exports = loginUser;
