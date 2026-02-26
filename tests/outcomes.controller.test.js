
jest.mock("../src/services/outcomes.service", () => ({
  getAllOutcomes: jest.fn(),
  getOutcomeById: jest.fn(),
  getMarketOutcomes: jest.fn(),
  createOutcome: jest.fn(),
  updateOutcome: jest.fn(),
  deleteOutcome: jest.fn(),
  outcomeExists: jest.fn(),
  // Called by createOutcome controller but not present in service object;
  // providing it here so the controller's call is interceptable.
  marketExists: jest.fn(),
}));

const outcomesService = require("../src/services/outcomes.service");
const {
  getOutcomes,
  getOutcomeById,
  getMarketOutcomes,
  createOutcome,
  updateOutcome,
  deleteOutcome,
} = require("../src/controllers/outcomes.controller");

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

// ─── getOutcomes ──────────────────────────────────────────────────────────────

describe("getOutcomes", () => {
  test("returns 200 with paginated outcomes", async () => {
    outcomesService.getAllOutcomes.mockResolvedValue({
      rows: [{ id: 1, description: "Outcome A" }],
      total: 1,
    });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await getOutcomes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    outcomesService.getAllOutcomes.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getOutcomes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getOutcomeById ───────────────────────────────────────────────────────────

describe("getOutcomeById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await getOutcomeById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid outcome ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getOutcomeById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when outcome is not found", async () => {
    outcomesService.getOutcomeById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getOutcomeById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 200 with outcome on success", async () => {
    const fakeOutcome = { id: 1, description: "Team A wins" };
    outcomesService.getOutcomeById.mockResolvedValue(fakeOutcome);

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getOutcomeById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeOutcome);
  });

  test("returns 500 when service throws", async () => {
    outcomesService.getOutcomeById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getOutcomeById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getMarketOutcomes ────────────────────────────────────────────────────────

describe("getMarketOutcomes", () => {
  test("returns 400 for invalid market ID", async () => {
    const req = mockReq({ params: { marketId: "bad" } });
    const res = mockRes();

    await getMarketOutcomes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid market ID" });
  });

  test("returns 200 with paginated outcomes on success", async () => {
    outcomesService.getMarketOutcomes.mockResolvedValue({
      rows: [{ id: 1, description: "Team A wins" }],
      total: 1,
    });

    const req = mockReq({ params: { marketId: "3" }, query: {} });
    const res = mockRes();

    await getMarketOutcomes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    outcomesService.getMarketOutcomes.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { marketId: "3" }, query: {} });
    const res = mockRes();

    await getMarketOutcomes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── createOutcome ────────────────────────────────────────────────────────────

describe("createOutcome", () => {
  test("returns 400 when market_id is missing", async () => {
    const req = mockReq({ body: { description: "Valid description" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Valid market_id is required" });
  });

  test("returns 400 when market_id is not a positive integer", async () => {
    const req = mockReq({ body: { market_id: -1, description: "Valid description" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when description is missing", async () => {
    const req = mockReq({ body: { market_id: 1 } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "description is required" });
  });

  test("returns 400 when description is too short (< 3 chars)", async () => {
    const req = mockReq({ body: { market_id: 1, description: "AB" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when description is too long (> 500 chars)", async () => {
    const req = mockReq({
      body: { market_id: 1, description: "D".repeat(501) },
    });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when market does not exist", async () => {
    outcomesService.marketExists.mockResolvedValue(false);

    const req = mockReq({ body: { market_id: 1, description: "Team A wins" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Market not found" });
  });

  test("returns 201 with created outcome on success", async () => {
    outcomesService.marketExists.mockResolvedValue(true);
    const fakeOutcome = { id: 5, market_id: 1, description: "Team A wins" };
    outcomesService.createOutcome.mockResolvedValue(fakeOutcome);

    const req = mockReq({ body: { market_id: 1, description: "Team A wins" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeOutcome);
  });

  test("returns 500 when service throws", async () => {
    outcomesService.marketExists.mockResolvedValue(true);
    outcomesService.createOutcome.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ body: { market_id: 1, description: "Team A wins" } });
    const res = mockRes();

    await createOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating outcome" });
  });
});

// ─── updateOutcome ────────────────────────────────────────────────────────────

describe("updateOutcome", () => {
  test("returns 400 for invalid outcome ID", async () => {
    const req = mockReq({
      params: { id: "not-a-number" },
      body: { description: "Updated" },
    });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid outcome ID" });
  });

  test("returns 400 when description is missing", async () => {
    const req = mockReq({ params: { id: "1" }, body: {} });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "description is required" });
  });

  test("returns 400 when description is too short", async () => {
    const req = mockReq({ params: { id: "1" }, body: { description: "AB" } });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when description is too long", async () => {
    const req = mockReq({
      params: { id: "1" },
      body: { description: "D".repeat(501) },
    });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when outcome does not exist", async () => {
    outcomesService.outcomeExists.mockResolvedValue(false);

    const req = mockReq({
      params: { id: "99" },
      body: { description: "Updated description" },
    });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 200 with updated outcome on success", async () => {
    outcomesService.outcomeExists.mockResolvedValue(true);
    const updated = { id: 1, description: "Updated description" };
    outcomesService.updateOutcome.mockResolvedValue(updated);

    const req = mockReq({
      params: { id: "1" },
      body: { description: "Updated description" },
    });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("returns 500 when service throws", async () => {
    outcomesService.outcomeExists.mockResolvedValue(true);
    outcomesService.updateOutcome.mockRejectedValue(new Error("DB error"));

    const req = mockReq({
      params: { id: "1" },
      body: { description: "Updated description" },
    });
    const res = mockRes();

    await updateOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error updating outcome" });
  });
});

// ─── deleteOutcome ────────────────────────────────────────────────────────────

describe("deleteOutcome", () => {
  test("returns 400 for invalid outcome ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await deleteOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid outcome ID" });
  });

  test("returns 404 when outcome is not found", async () => {
    outcomesService.deleteOutcome.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await deleteOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 200 with confirmation on success", async () => {
    outcomesService.deleteOutcome.mockResolvedValue({ id: 1 });

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deleteOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Outcome deleted successfully",
      id: 1,
    });
  });

  test("returns 500 when service throws", async () => {
    outcomesService.deleteOutcome.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deleteOutcome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error deleting outcome" });
  });
});
