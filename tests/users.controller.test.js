jest.mock("../src/services/users.service");

const usersService = require("../src/services/users.service");
const {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserStats,
} = require("../src/controllers/users.controller");

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockReq = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  ...overrides,
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── getUsers ─────────────────────────────────────────────────────────────────

describe("getUsers", () => {
  test("returns 200 with paginated users", async () => {
    usersService.getAllUsers.mockResolvedValue({
      rows: [{ id: 1, username: "testuser" }],
      total: 1,
    });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    usersService.getAllUsers.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getUserById ──────────────────────────────────────────────────────────────

describe("getUserById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 for negative ID", async () => {
    const req = mockReq({ params: { id: "-5" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when user is not found", async () => {
    usersService.getUserById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns 200 with user on success", async () => {
    const fakeUser = { id: 1, username: "testuser", email: "test@utdallas.edu" };
    usersService.getUserById.mockResolvedValue(fakeUser);

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("returns 500 when service throws", async () => {
    usersService.getUserById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getUserByUsername ────────────────────────────────────────────────────────

describe("getUserByUsername", () => {
  test("returns 400 when username is an empty string", async () => {
    const req = mockReq({ params: { username: "" } });
    const res = mockRes();

    await getUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Username is required" });
  });

  test("returns 400 when username is only whitespace", async () => {
    const req = mockReq({ params: { username: "   " } });
    const res = mockRes();

    await getUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when user is not found", async () => {
    usersService.getUserByUsername.mockResolvedValue(null);

    const req = mockReq({ params: { username: "unknownuser" } });
    const res = mockRes();

    await getUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns 200 with user on success", async () => {
    const fakeUser = { id: 1, username: "testuser", email: "test@utdallas.edu" };
    usersService.getUserByUsername.mockResolvedValue(fakeUser);

    const req = mockReq({ params: { username: "testuser" } });
    const res = mockRes();

    await getUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("returns 500 when service throws", async () => {
    usersService.getUserByUsername.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { username: "testuser" } });
    const res = mockRes();

    await getUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getUserStats ─────────────────────────────────────────────────────────────

describe("getUserStats", () => {
  test("returns 400 for non-numeric user ID", async () => {
    const req = mockReq({ params: { userId: "abc" } });
    const res = mockRes();

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user ID" });
  });

  test("returns 400 for user ID of zero", async () => {
    const req = mockReq({ params: { userId: "0" } });
    const res = mockRes();

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when user is not found", async () => {
    usersService.getUserStats.mockResolvedValue(null);

    const req = mockReq({ params: { userId: "99" } });
    const res = mockRes();

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns 200 with user stats on success", async () => {
    const fakeStats = {
      id: 1,
      username: "testuser",
      token_balance: 450,
      total_bets: 5,
      total_wagered: 200,
      total_won: 150,
    };
    usersService.getUserStats.mockResolvedValue(fakeStats);

    const req = mockReq({ params: { userId: "1" } });
    const res = mockRes();

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeStats);
  });

  test("returns 500 when service throws", async () => {
    usersService.getUserStats.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { userId: "1" } });
    const res = mockRes();

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});