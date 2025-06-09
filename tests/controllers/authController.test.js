//creting mock database to not effect the real db
jest.mock("../../src/models/userModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

// Mocking logger to stop console statements
jest.mock("../../src/logger/index", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginUser = require("../../src/controllers/authController");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// afterAll(() => {
//   console.log.mockRestore();
//   console.info.mockRestore();
//   console.warn.mockRestore();
//   console.error.mockRestore();
// });

describe("POST /login to login user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //to test if there is any validation errors
  it("should return 422 if validation fails", async () => {
    //passing empty body to check validation is working or not
    const res = await request(app).post("/login").send({});
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  //to test if the user exists or not
  it("should return 401 if there is no user exists", async () => {
    User.findOne.mockResolvedValue(null); // expected output
    const res = await request(app).post("/login").send({
      username: "nonexistentuser",
      password: "password123",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  //test if the user entered password is matching by decrypting
  it("should return 401 if password is incorrect", async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      username: "existinguser",
      password: "hashedpassword",
    });
    bcrypt.compare.mockResolvedValue(false); //output false because password not matched

    const res = await request(app).post("/login").send({
      username: "existinguser",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  //test to user logged in successfully
  it("should login successfully and send token", async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      username: "existinguser",
      password: "hashedpassword",
    });
    bcrypt.compare.mockResolvedValue(true); //output true because passwords match
    jwt.sign.mockReturnValue("tokenExpected");

    const res = await request(app).post("/login").send({
      username: "existinguser",
      password: "correctpassword",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login Succesful");
    expect(res.body.token).toBe("tokenExpected");
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 1, username: "existinguser" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  //to test if any error happend
  it("should call next(error) on unexpected error", async () => {
    const error = new Error("DB failure");
    User.findOne.mockRejectedValue(error);

    // Call controller directly instead of calling api route
    const next = jest.fn();
    const req = {
      body: {
        username: "user",
        password: "pass123",
      },
    };
    const res = {};

    await loginUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
