const { Sequelize } = require("sequelize");
const path = require("path");
const sqlite3 = require("sqlite3");
const logger = require("../logger");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"),
  logging: false,
  dialectOptions: {
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
  },
});

module.exports = sequelize;
