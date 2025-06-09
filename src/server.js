require("dotenv").config();
const app = require("./app");
const logger = require("./logger");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected successfully.");

    await sequelize.query("PRAGMA journal_mode=WAL;");
    logger.info("✅ WAL mode enabled for SQLite");

    await sequelize.sync();
    logger.info("✅ Models synced successfully.");

    app.listen(PORT, () => {
      logger.info(`🚀 Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}
startServer();
