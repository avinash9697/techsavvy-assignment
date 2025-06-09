const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./logger");
const errorHandler = require("./middlewares/errorHandler");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoute");
const reportRoutes = require("./routes/reportRoutes");
const productRoutes = require("./routes/productRoutes");

//Instance of Express Application
const app = express();

//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

app.use("/login", authRoutes);
app.use("/users", userRoutes);
app.use("/upload-csv", uploadRoutes);
app.use("/", reportRoutes);
app.use("/productslist", productRoutes);
app.use(errorHandler);

module.exports = app;
