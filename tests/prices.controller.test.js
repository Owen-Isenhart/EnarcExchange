
jest.mock("../src/services/prices.service");

const pricesService = require("../src/services/prices.service");
const {
  getPrices,
  getPriceById,
  getOutcomePriceHistory,
  getLatestPrices,
  createPrice,
  updatePrice,
  deletePrice,
} = require("../src/controllers/price.controller");

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

// ─── getPrices ────────────────────────────────────────────────────────────────

describe("getPrices", () => {
  test("returns 200 with paginated prices", async () => {
    pricesService.getAllPrices.mockResolvedValue({
      rows: [{ id: 1, price: 0.6 }],
      total: 1,
    });

    const req = mockReq({ query: {} });
    const res = mockRes();

    await getPrices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    pricesService.getAllPrices.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getPrices(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getPriceById ─────────────────────────────────────────────────────────────

describe("getPriceById", () => {
  test("returns 400 for non-numeric ID", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();

    await getPriceById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid price ID" });
  });

  test("returns 400 for ID of zero", async () => {
    const req = mockReq({ params: { id: "0" } });
    const res = mockRes();

    await getPriceById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when price record is not found", async () => {
    pricesService.getPriceById.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await getPriceById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Price record not found" });
  });

  test("returns 200 with price record on success", async () => {
    const fakePrice = { id: 1, outcome_id: 2, price: 0.75 };
    pricesService.getPriceById.mockResolvedValue(fakePrice);

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getPriceById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakePrice);
  });

  test("returns 500 when service throws", async () => {
    pricesService.getPriceById.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await getPriceById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getOutcomePriceHistory ───────────────────────────────────────────────────

describe("getOutcomePriceHistory", () => {
  test("returns 400 for invalid outcome ID", async () => {
    const req = mockReq({ params: { outcomeId: "xyz" } });
    const res = mockRes();

    await getOutcomePriceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid outcome ID" });
  });

  test("returns 404 when outcome does not exist", async () => {
    pricesService.outcomeExists.mockResolvedValue(false);

    const req = mockReq({ params: { outcomeId: "99" }, query: {} });
    const res = mockRes();

    await getOutcomePriceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 200 with paginated price history on success", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    pricesService.getOutcomePriceHistory.mockResolvedValue({
      rows: [{ id: 1, price: 0.5 }],
      total: 1,
    });

    const req = mockReq({ params: { outcomeId: "2" }, query: {} });
    const res = mockRes();

    await getOutcomePriceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) })
    );
  });

  test("returns 500 when service throws", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    pricesService.getOutcomePriceHistory.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { outcomeId: "2" }, query: {} });
    const res = mockRes();

    await getOutcomePriceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── getLatestPrices ──────────────────────────────────────────────────────────

describe("getLatestPrices", () => {
  test("returns 200 with latest prices", async () => {
    const fakePrices = [{ outcome_id: 1, price: 0.6 }];
    pricesService.getLatestPrices.mockResolvedValue(fakePrices);

    const req = mockReq();
    const res = mockRes();

    await getLatestPrices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakePrices);
  });

  test("returns 500 when service throws", async () => {
    pricesService.getLatestPrices.mockRejectedValue(new Error("DB error"));

    const req = mockReq();
    const res = mockRes();

    await getLatestPrices(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

// ─── createPrice ──────────────────────────────────────────────────────────────

describe("createPrice", () => {
  test("returns 400 when outcome_id is missing", async () => {
    const req = mockReq({ body: { price: 0.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Valid outcome_id is required" });
  });

  test("returns 400 when outcome_id is not a positive integer", async () => {
    const req = mockReq({ body: { outcome_id: 0, price: 0.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when price is missing", async () => {
    const req = mockReq({ body: { outcome_id: 1 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "price must be a number between 0 and 1",
    });
  });

  test("returns 400 when price is greater than 1", async () => {
    const req = mockReq({ body: { outcome_id: 1, price: 1.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "price must be a number between 0 and 1",
    });
  });

  test("returns 400 when price is negative", async () => {
    const req = mockReq({ body: { outcome_id: 1, price: -0.1 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 404 when outcome does not exist", async () => {
    pricesService.outcomeExists.mockResolvedValue(false);

    const req = mockReq({ body: { outcome_id: 1, price: 0.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Outcome not found" });
  });

  test("returns 201 with created price record on success", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    const fakePriceRecord = { id: 10, outcome_id: 1, price: 0.5 };
    pricesService.createPrice.mockResolvedValue(fakePriceRecord);

    const req = mockReq({ body: { outcome_id: 1, price: 0.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakePriceRecord);
  });

  test("accepts price of exactly 0", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    pricesService.createPrice.mockResolvedValue({ id: 1, outcome_id: 1, price: 0 });

    const req = mockReq({ body: { outcome_id: 1, price: 0 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("accepts price of exactly 1", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    pricesService.createPrice.mockResolvedValue({ id: 1, outcome_id: 1, price: 1 });

    const req = mockReq({ body: { outcome_id: 1, price: 1 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("returns 500 when service throws", async () => {
    pricesService.outcomeExists.mockResolvedValue(true);
    pricesService.createPrice.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ body: { outcome_id: 1, price: 0.5 } });
    const res = mockRes();

    await createPrice(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error creating price record" });
  });
});

// ─── updatePrice ──────────────────────────────────────────────────────────────

describe("updatePrice", () => {
  test("returns 400 for invalid price ID", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { price: 0.5 } });
    const res = mockRes();

    await updatePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid price ID" });
  });

  test("returns 400 when price is out of 0-1 range", async () => {
    const req = mockReq({ params: { id: "1" }, body: { price: 2 } });
    const res = mockRes();

    await updatePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "price must be a number between 0 and 1",
    });
  });

  test("returns 404 when price record does not exist", async () => {
    pricesService.priceExists.mockResolvedValue(false);

    const req = mockReq({ params: { id: "99" }, body: { price: 0.5 } });
    const res = mockRes();

    await updatePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Price record not found" });
  });

  test("returns 200 with updated price on success", async () => {
    pricesService.priceExists.mockResolvedValue(true);
    const updated = { id: 1, outcome_id: 2, price: 0.75 };
    pricesService.updatePrice.mockResolvedValue(updated);

    const req = mockReq({ params: { id: "1" }, body: { price: 0.75 } });
    const res = mockRes();

    await updatePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("returns 500 when service throws", async () => {
    pricesService.priceExists.mockResolvedValue(true);
    pricesService.updatePrice.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" }, body: { price: 0.5 } });
    const res = mockRes();

    await updatePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error updating price" });
  });
});

// ─── deletePrice ──────────────────────────────────────────────────────────────

describe("deletePrice", () => {
  test("returns 400 for invalid price ID", async () => {
    const req = mockReq({ params: { id: "bad" } });
    const res = mockRes();

    await deletePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid price ID" });
  });

  test("returns 404 when price record is not found", async () => {
    pricesService.deletePrice.mockResolvedValue(null);

    const req = mockReq({ params: { id: "99" } });
    const res = mockRes();

    await deletePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Price record not found" });
  });

  test("returns 200 with confirmation on success", async () => {
    pricesService.deletePrice.mockResolvedValue({ id: 1 });

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deletePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Price record deleted successfully",
      id: 1,
    });
  });

  test("returns 500 when service throws", async () => {
    pricesService.deletePrice.mockRejectedValue(new Error("DB error"));

    const req = mockReq({ params: { id: "1" } });
    const res = mockRes();

    await deletePrice(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error deleting price record" });
  });
});
