
jest.mock("../src/services/transactions.service");

const transactionsService = require("../src/services/transactions.service");
const {
  getTransactions,
  getTransactionById,
  getUserTransactions,
  createTransaction,
} = require("../src/controllers/transactions.controller");

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
  user: { id: 1 },
  ...overrides,
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── getTransactions ──────────────────────────────────────────────────────────

describe("getTransactions", () => {
  test("returns 200 with paginated transactions", async () => {
    transactionsService.getAllTransactions.mockResolvedValue({
      rows: [{ id: 1, amount: 100, reason: "Bet placed" }],
      total: 1,
    });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await getTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    transactionsService.getAllTransactions.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getTransactionById ───────────────────────────────────────────────────────

describe("getTransactionById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await getTransactionById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid transaction ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getTransactionById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when transaction is not found", async () => {
    transactionsService.getTransactionById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getTransactionById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Transaction not found" });
  });

  test("returns 200 with transaction on success", async () => {
    const fakeTx = { id: 1, user_id: 1, amount: 100, reason: "Bet placed" };
    transactionsService.getTransactionById.mockResolvedValue(fakeTx);

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getTransactionById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeTx);
  });

  test("returns 500 when service throws", async () => {
    transactionsService.getTransactionById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getTransactionById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getUserTransactions ──────────────────────────────────────────────────────

describe("getUserTransactions", () => {
  test("returns 400 for invalid user ID", async () => {
    const req = mockReq({ params: { userId: "abc" } });
    const res = mockRes();

    await getUserTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user ID" });
  });

  test("returns 400 for user ID of zero", async () => {
    const req = mockReq({ params: { userId: "0" } });
    const res = mockRes();

    await getUserTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 200 with paginated transactions on success", async () => {
    transactionsService.getUserTransactions.mockResolvedValue({
      rows: [{ id: 1, amount: 100 }],
      total: 1,
    });

    const req = mockReq({ params: { userId: "1" }, query: {} });
    const res = mockRes();

    await getUserTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    transactionsService.getUserTransactions.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { userId: "1" }, query: {} });
    const res = mockRes();

    await getUserTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── createTransaction ────────────────────────────────────────────────────────

describe("createTransaction", () => {
  test("returns 400 when user_id is missing", async () => {
    const req = mockReq({ body: { amount: 100, reason: "Test reason" } });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Valid user_id is required" });
  });

  test("returns 400 when user_id is not a positive integer", async () => {
    const req = mockReq({ body: { user_id: -1, amount: 100, reason: "Test" } });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when amount is not an integer", async () => {
    const req = mockReq({
      body: { user_id: 1, amount: 10.5, reason: "Test reason" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "amount must be an integer" });
  });

  test("returns 400 when amount is a string", async () => {
    const req = mockReq({
      body: { user_id: 1, amount: "100", reason: "Test reason" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "amount must be an integer" });
  });

  test("returns 400 when reason is missing", async () => {
    const req = mockReq({ body: { user_id: 1, amount: 100 } });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "reason is required" });
  });

  test("returns 400 when reason is too short (< 3 chars)", async () => {
    const req = mockReq({ body: { user_id: 1, amount: 100, reason: "AB" } });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when reason is too long (> 200 chars)", async () => {
    const req = mockReq({
      body: { user_id: 1, amount: 100, reason: "R".repeat(201) },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when user does not exist", async () => {
    transactionsService.userExists.mockResolvedValue(false);

    const req = mockReq({
      body: { user_id: 99, amount: 100, reason: "Test reason" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("accepts negative amounts (deductions)", async () => {
    transactionsService.userExists.mockResolvedValue(true);
    const fakeTx = { id: 1, user_id: 1, amount: -50, reason: "Bet placed" };
    transactionsService.createTransaction.mockResolvedValue(fakeTx);

    const req = mockReq({
      body: { user_id: 1, amount: -50, reason: "Bet placed" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeTx);
  });

  test("returns 201 with created transaction on success", async () => {
    transactionsService.userExists.mockResolvedValue(true);
    const fakeTx = { id: 1, user_id: 1, amount: 100, reason: "Signup bonus" };
    transactionsService.createTransaction.mockResolvedValue(fakeTx);

    const req = mockReq({
      body: { user_id: 1, amount: 100, reason: "Signup bonus" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeTx);
  });

  test("returns 500 on unexpected service error", async () => {
    transactionsService.userExists.mockResolvedValue(true);
    transactionsService.createTransaction.mockRejectedValue(new Error("DB error"));

    const req = mockReq({
      body: { user_id: 1, amount: 100, reason: "Signup bonus" },
    });
    const res = mockRes();

    await createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating transaction" });
  });
});
