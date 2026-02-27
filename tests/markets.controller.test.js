jest.mock("../src/services/markets.service");

const marketsService = require("../src/services/markets.service");
const {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
} = require("../src/controllers/markets.controller");

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

// ─── getMarkets ───────────────────────────────────────────────────────────────

describe("getMarkets", () => {
  test("returns 200 with paginated markets", async () => {
    marketsService.getAllMarkets.mockResolvedValue({
      rows: [{ id: 1, name: "Test Market" }],
      total: 1,
    });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await getMarkets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    marketsService.getAllMarkets.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getMarkets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getMarketById ────────────────────────────────────────────────────────────

describe("getMarketById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "xyz" } });
    const res = mockRes();

    await getMarketById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid market ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getMarketById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when market is not found", async () => {
    marketsService.getMarketById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getMarketById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Market not found" });
  });

  test("returns 200 with market on success", async () => {
    const fakeMarket = { id: 1, name: "Test Market", status: "open" };
    marketsService.getMarketById.mockResolvedValue(fakeMarket);

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getMarketById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeMarket);
  });

  test("returns 500 when service throws", async () => {
    marketsService.getMarketById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getMarketById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── createMarket ─────────────────────────────────────────────────────────────

describe("createMarket", () => {
  const validBody = {
    name: "Valid Market Name",
    description: "A valid description",
    start_time: "2025-01-01T00:00:00Z",
    end_time: "2025-12-31T00:00:00Z",
  };

  test("returns 400 when name is missing", async () => {
    const req = mockReq({ body: { ...validBody, name: undefined } });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Market name is required" });
  });

  test("returns 400 when name is too short (< 3 chars)", async () => {
    const req = mockReq({ body: { ...validBody, name: "AB" } });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when name is too long (> 200 chars)", async () => {
    const req = mockReq({ body: { ...validBody, name: "A".repeat(201) } });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when description exceeds 1000 characters", async () => {
    const req = mockReq({
      body: { ...validBody, description: "D".repeat(1001) },
    });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Market description cannot exceed 1000 characters",
    });
  });

  test("returns 400 when start_time or end_time is missing", async () => {
    const req = mockReq({ body: { name: "Valid Name" } });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "start_time and end_time are required",
    });
  });

  test("returns 400 when dates are not valid ISO 8601", async () => {
    const req = mockReq({
      body: { ...validBody, start_time: "not-a-date", end_time: "also-not" },
    });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "start_time and end_time must be valid ISO 8601 dates",
    });
  });

  test("returns 400 when end_time is before or equal to start_time", async () => {
    const req = mockReq({
      body: {
        ...validBody,
        start_time: "2025-06-01T00:00:00Z",
        end_time: "2025-01-01T00:00:00Z",
      },
    });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "end_time must be after start_time",
    });
  });

  test("returns 400 when liquidity_parameter is out of 0-1 range", async () => {
    const req = mockReq({ body: { ...validBody, liquidity_parameter: 1.5 } });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "liquidity_parameter must be a number between 0 and 1",
    });
  });

  test("returns 201 with created market on success", async () => {
    const fakeMarket = { id: 1, name: "Valid Market Name", status: "open" };
    marketsService.createMarket.mockResolvedValue(fakeMarket);

    const req = mockReq({ body: validBody });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeMarket);
  });

  test("returns 500 when service throws", async () => {
    marketsService.createMarket.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ body: validBody });
    const res = mockRes();

    await createMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating market" });
  });
});

// ─── updateMarket ─────────────────────────────────────────────────────────────

describe("updateMarket", () => {
  test("returns 400 for invalid market ID", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { name: "New Name" } });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid market ID" });
  });

  test("returns 404 when market does not exist", async () => {
    marketsService.getMarketById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" }, body: { name: "New Name" } });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Market not found" });
  });

  test("returns 400 when status is invalid", async () => {
    marketsService.getMarketById.mockResolvedValue({ id: 1, name: "Market" });

    const req = mockReq({
      params: { id: "1" },
      body: { status: "unknown-status" },
    });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Status must be one of: open, closed, resolved",
    });
  });

  test("returns 400 when no fields are provided to update", async () => {
    marketsService.getMarketById.mockResolvedValue({ id: 1, name: "Market" });

    const req = mockReq({ params: { id: "1" }, body: {} });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No fields to update" });
  });

  test("returns 200 with updated market on success", async () => {
    marketsService.getMarketById.mockResolvedValue({ id: 1, name: "Old Name" });
    const updated = { id: 1, name: "New Name", status: "open" };
    marketsService.updateMarket.mockResolvedValue(updated);

    const req = mockReq({ params: { id: "1" }, body: { name: "New Name" } });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("returns 200 when updating status to a valid value", async () => {
    marketsService.getMarketById.mockResolvedValue({ id: 1, name: "Market" });
    const updated = { id: 1, name: "Market", status: "closed" };
    marketsService.updateMarket.mockResolvedValue(updated);

    const req = mockReq({ params: { id: "1" }, body: { status: "closed" } });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("returns 500 when service throws", async () => {
    marketsService.getMarketById.mockResolvedValue({ id: 1, name: "Market" });
    marketsService.updateMarket.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" }, body: { name: "New Name" } });
    const res = mockRes();

    await updateMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error updating market" });
  });
});

// ─── deleteMarket ─────────────────────────────────────────────────────────────

describe("deleteMarket", () => {
  test("returns 400 for invalid market ID", async () => {
    const req = mockReq({ params: { id: "not-an-id" } });
    const res = mockRes();

    await deleteMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid market ID" });
  });

  test("returns 404 when market is not found", async () => {
    marketsService.deleteMarket.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await deleteMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Market not found" });
  });

  test("returns 200 with confirmation on success", async () => {
    marketsService.deleteMarket.mockResolvedValue({ id: 1 });

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deleteMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Market deleted successfully",
      id: 1,
    });
  });

  test("returns 500 when service throws", async () => {
    marketsService.deleteMarket.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deleteMarket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error deleting market" });
  });
});