const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const logger = require("../logger");
const { Op } = require("sequelize");

//creating new user
const createUser = async (req, res, next) => {
  try {
    logger.info("Creating User...");
    //checking for any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation error happend");
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;

    //checking whether the user is already a existing user
    const existingUserCheck = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    //if already existing then registration wont work
    if (existingUserCheck) {
      logger.warn("User already exists with username or email");
      return res
        .status(409)
        .json({ message: "Username or email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
    });

    logger.info(`user created successfully ${user.id}`);
    res.status(201).json({
      message: "User Created",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    next(error);
  }
};

//get users
const getUsers = async (req, res, next) => {
  try {
    logger.info("Fetching Users");
    const { userId } = req.params;

    //if user id is passed then it means to fetch only one user
    if (userId) {
      const user = await User.findByPk(userId, {
        attributes: ["id", "username", "email"],
      });
      if (!user) {
        logger.warn("user not found");
        return res.status(404).json({ message: "User Not Found" });
      }
      return res.json({ user });
    }
    //if user id is not passed fetch all users
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

//updating users
const updateUser = async (req, res, next) => {
  try {
    logger.info("Updating user");
    const { userId } = req.params;

    //checking for any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation error happend");
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;

    //finding user exists or not
    const userCheck = await User.findByPk(userId);

    if (!userCheck) {
      logger.warn("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    //check whether the new username or password already is use by any one
    //array to add email or username conditions
    let checkConditions = [];
    if (username) checkConditions.push({ username });
    if (email) checkConditions.push({ email });
    if (checkConditions.length > 0) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: userId },
          [Op.or]: checkConditions, //we are passing checkConditions array here
        },
      });
      if (existingUser) {
        logger.warn("username or email already in use");
        return res
          .status(409)
          .json({ message: "Username or email already in use" });
      }
    }

    const updateData = { username, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await userCheck.update(updateData);
    logger.info(`User updated: ${userId}`);
    res.json({
      message: "User updated",
      user: { username: userCheck.username },
    });
  } catch (error) {
    next(error);
  }
};

//deleting users
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    logger.info("Deleting User");

    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn("user not found");
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    logger.info(`user ${userId} deleted`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
