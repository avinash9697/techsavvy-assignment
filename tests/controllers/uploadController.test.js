jest.mock("sqlite3", () => {
  return {
    verbose: () => ({
      Database: jest.fn().mockImplementation(() => ({
        run: jest.fn(),
        get: jest.fn(),
        all: jest.fn(),
        exec: jest.fn(),
        close: jest.fn(),
      })),
    }),
  };
});
// jest.mock("fs");
// jest.mock("fs/promises");
jest.mock("../../src/models/productModel", () => ({
  bulkCreate: jest.fn().mockResolvedValue([]), // mocks bulkCreate to resolve immediately
}));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

// Mocking logger to stop console statements
jest.mock("../../src/logger/index", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const request = require("supertest");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const stream = require("stream");
const app = require("../../src/app");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Product = require("../../src/models/productModel");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /upload-csv uploading csv file and inserting data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //   test to check if token is passed or not
  it("should return 401 if there is no token provided", async () => {
    const res = await request(app).post("/upload-csv"); // no Authorization header

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access Denied");
  });
  //test to check if the file is passed or not
  it("should return 400 if no file is uploaded", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    const res = await request(app)
      .post("/upload-csv")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("CSV file is required");
  });

  //test to check successful file uploadation
  it("should insert data and return 200 if token and file are valid", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });
    Product.bulkCreate.mockResolvedValue([]);
    const filePath = path.join(__dirname, "../testFiles/sample.csv");
    const res = await request(app)
      .post("/upload-csv")
      .set("Authorization", "Bearer faketoken")
      .attach("file", filePath);

    expect(res.statusCode).toBe(200);
    expect(Product.bulkCreate).toHaveBeenCalled();
  });
});
