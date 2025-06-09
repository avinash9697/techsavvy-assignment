const express = require("express");
const {
  userValidationRules,
  updateValidationRules,
} = require("../validators/userValidator");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", userValidationRules, createUser);
router.get("/", authenticate, getUsers);
router.get("/:userId", authenticate, getUsers);
router.put("/:userId", authenticate, updateValidationRules, updateUser);
router.delete("/:userId", authenticate, deleteUser);

module.exports = router;
