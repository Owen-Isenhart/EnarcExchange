process.env.JWT_SECRET = "test-secret-key";

const express = require("express");
const request = require("supertest");

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

jest.mock("../src/services/auth.service");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// Mock the authenticate middleware so /me route always passes auth
jest.mock("../src/middleware/auth", () => (req, res, next) => {
  req.user = { id: 1, email: "test@utdallas.edu", username: "testuser" };
  next();
});

const authService = require("../src/services/auth.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createApp = () => {
  const app = express();
  app.use(express.json());
  // Re-require each time so mocks are applied
  const authRoutes = require("../src/routes/auth");
  app.use("/api/auth", authRoutes);
  // Basic error handler for asyncHandler-caught errors
  app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal server error" });
  });
  return app;
};

describe("Auth Routes", () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /api/auth/signup ─────────────────────────────────────────────────

  describe("POST /api/auth/signup", () => {
    test("returns 400 when all fields are missing", async () => {
      const res = await request(app).post("/api/auth/signup").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("returns 400 when email is not @utdallas.edu", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "user@gmail.com",
        username: "testuser",
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/utdallas/i);
    });

    test("returns 400 when username is too short (< 3 chars)", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "ab",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    test("returns 400 when username is too long (> 50 chars)", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "a".repeat(51),
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    test("returns 400 when password is too short (< 8 chars)", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "testuser",
        password: "short",
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/8 characters/i);
    });

    test("returns 409 when email already exists", async () => {
      authService.emailExists.mockResolvedValue(true);

      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "testuser",
        password: "password123",
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/email/i);
    });

    test("returns 409 when username already exists", async () => {
      authService.emailExists.mockResolvedValue(false);
      authService.usernameExists.mockResolvedValue(true);

      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "testuser",
        password: "password123",
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/username/i);
    });

    test("returns 201 with token and user on successful signup", async () => {
      authService.emailExists.mockResolvedValue(false);
      authService.usernameExists.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue("hashed-password");
      authService.createUser.mockResolvedValue({
        id: 1,
        email: "user@utdallas.edu",
        username: "testuser",
      });
      jwt.sign.mockReturnValue("mock-token");

      const res = await request(app).post("/api/auth/signup").send({
        email: "user@utdallas.edu",
        username: "testuser",
        password: "password123",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token", "mock-token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("id", 1);
    });
  });

  // ─── POST /api/auth/login ──────────────────────────────────────────────────

  describe("POST /api/auth/login", () => {
    test("returns 400 when fields are missing", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("returns 401 when user is not found", async () => {
      authService.getUserByEmail.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "user@utdallas.edu",
        password: "password123",
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid/i);
    });

    test("returns 401 when password does not match", async () => {
      authService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: "user@utdallas.edu",
        username: "testuser",
        password_hash: "hashed-password",
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post("/api/auth/login").send({
        email: "user@utdallas.edu",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
    });

    test("returns 200 with token and user (without password_hash) on success", async () => {
      authService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: "user@utdallas.edu",
        username: "testuser",
        password_hash: "hashed-password",
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock-token");

      const res = await request(app).post("/api/auth/login").send({
        email: "user@utdallas.edu",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token", "mock-token");
      expect(res.body.user).not.toHaveProperty("password_hash");
      expect(res.body.user).toHaveProperty("id", 1);
    });
  });

  // ─── GET /api/auth/me ─────────────────────────────────────────────────────

  describe("GET /api/auth/me", () => {
    test("returns 404 when authenticated user is not found in DB", async () => {
      authService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer mock-token");
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    test("returns 200 with user on success", async () => {
      authService.getUserById.mockResolvedValue({
        id: 1,
        email: "user@utdallas.edu",
        username: "testuser",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer mock-token");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("id", 1);
    });
  });
});