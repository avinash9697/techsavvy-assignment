const jwt = require("jsonwebtoken");
const logger = require("../logger");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("No Token , Access Denied");
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn("Invalid token");
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

module.exports = authenticate;
