
jest.mock("../src/services/bets.service");

const betsService = require("../src/services/bets.service");
const {
  getBets,
  getBetById,
  getUserBets,
  getMarketBets,
  createBet,
} = require("../src/controllers/bets.controller");

// Factory helpers
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

// ─── getBets ─────────────────────────────────────────────────────────────────

describe("getBets", () => {
  test("returns 200 with paginated bets", async () => {
    betsService.getAllBets.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const req = mockReq({ query: { page: "1", limit: "20" } });
    const res = mockRes();

    await getBets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    betsService.getAllBets.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getBets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getBetById ───────────────────────────────────────────────────────────────

describe("getBetById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await getBetById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid bet ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getBetById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when bet is not found", async () => {
    betsService.getBetById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getBetById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Bet not found" });
  });

  test("returns 200 with bet on success", async () => {
    betsService.getBetById.mockResolvedValue({ id: 1, amount: 50 });

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getBetById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, amount: 50 });
  });

  test("returns 500 when service throws", async () => {
    betsService.getBetById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getBetById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getUserBets ──────────────────────────────────────────────────────────────

describe("getUserBets", () => {
  test("returns 400 for invalid user ID", async () => {
    const req = mockReq({ params: { userId: "abc" } });
    const res = mockRes();

    await getUserBets(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user ID" });
  });

  test("returns 200 with paginated bets on success", async () => {
    betsService.getUserBets.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const req = mockReq({ params: { userId: "1" }, query: {} });
    const res = mockRes();

    await getUserBets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    betsService.getUserBets.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { userId: "1" }, query: {} });
    const res = mockRes();

    await getUserBets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getMarketBets ────────────────────────────────────────────────────────────

describe("getMarketBets", () => {
  test("returns 400 for invalid market ID", async () => {
    const req = mockReq({ params: { marketId: "-1" } });
    const res = mockRes();

    await getMarketBets(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid market ID" });
  });

  test("returns 200 with paginated bets on success", async () => {
    betsService.getMarketBets.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const req = mockReq({ params: { marketId: "5" }, query: {} });
    const res = mockRes();

    await getMarketBets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    betsService.getMarketBets.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { marketId: "5" }, query: {} });
    const res = mockRes();

    await getMarketBets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── createBet ────────────────────────────────────────────────────────────────

describe("createBet", () => {
  test("returns 400 when outcome_id is missing", async () => {
    const req = mockReq({ body: { amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Valid outcome_id is required" });
  });

  test("returns 400 when outcome_id is not a positive integer", async () => {
    const req = mockReq({ body: { outcome_id: -5, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when amount is not a positive integer", async () => {
    const req = mockReq({ body: { outcome_id: 1, amount: -10 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "amount must be a positive integer",
    });
  });

  test("returns 400 when amount is zero", async () => {
    const req = mockReq({ body: { outcome_id: 1, amount: 0 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when user is not found", async () => {
    betsService.createBet.mockRejectedValue(new Error("User not found"));

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("returns 400 when user has insufficient token balance", async () => {
    betsService.createBet.mockRejectedValue(new Error("Insufficient token balance"));

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Insufficient token balance" });
  });

  test("returns 404 when outcome is not found", async () => {
    betsService.createBet.mockRejectedValue(new Error("Outcome not found"));

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 400 when market is not open for betting", async () => {
    betsService.createBet.mockRejectedValue(
      new Error("Market is not open for betting")
    );

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Cannot place bets on a closed or resolved market",
    });
  });

  test("returns 201 with the created bet on success", async () => {
    const fakeBet = { id: 10, user_id: 1, outcome_id: 1, amount: 50 };
    betsService.createBet.mockResolvedValue(fakeBet);

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeBet);
  });

  test("returns 500 on unexpected service error", async () => {
    betsService.createBet.mockRejectedValue(new Error("Unexpected DB error"));

    const req = mockReq({ body: { outcome_id: 1, amount: 50 } });
    const res = mockRes();

    await createBet(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating bet" });
  });
});
