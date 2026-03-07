/**
 * Logarithmic Market Scoring Rule (LMSR) — pure math only.
 * See: Gnosis LMSR primer, Oddhead blog, README links.
 *
 * Cost: C(q) = b * ln(sum_i exp(q_i / b))
 * Marginal price (probability) of outcome i: P_i = exp(q_i/b) / sum_k exp(q_k/b)
 * Cost to move from q to q': cost = C(q') - C(q)
 */

/**
 * LMSR cost function. q = array of quantities (shares outstanding) per outcome.
 * @param {number[]} q - quantities per outcome
 * @param {number} b - liquidity parameter
 * @returns {number}
 */
function cost(q, b) {
  if (b <= 0) throw new Error("LMSR: b must be positive");
  const n = q.length;
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.exp(q[i] / b);
  }
  return b * Math.log(sum);
}

/**
 * Marginal price (probability) for each outcome. Sum of returned array = 1.
 * @param {number[]} q - quantities per outcome
 * @param {number} b - liquidity parameter
 * @returns {number[]}
 */
function marginalPrices(q, b) {
  if (b <= 0) throw new Error("LMSR: b must be positive");
  const n = q.length;
  if (n === 0) return [];
  let sumExp = 0;
  const expQ = q.map((qi) => {
    const e = Math.exp(qi / b);
    sumExp += e;
    return e;
  });
  return expQ.map((e) => e / sumExp);
}

/**
 * Cost to buy `shares` of outcome at index `outcomeIndex` (0-based).
 * @param {number[]} q - current quantities
 * @param {number} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number} shares - number of shares to buy
 * @returns {number}
 */
function costToBuy(q, b, outcomeIndex, shares) {
  if (shares <= 0) return 0;
  const qNew = q.slice();
  qNew[outcomeIndex] = (qNew[outcomeIndex] || 0) + shares;
  return cost(qNew, b) - cost(q, b);
}

/**
 * How many shares of outcome at `outcomeIndex` can be bought for `costAmount` tokens.
 * Uses binary search (cost is increasing in shares).
 * @param {number[]} q - current quantities
 * @param {number} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number} costAmount - tokens to spend
 * @param {number} [tolerance=1e-6] - stop when cost error is below this
 * @returns {{ shares: number, cost: number }}
 */
function sharesForCost(q, b, outcomeIndex, costAmount, tolerance = 1e-6) {
  if (costAmount <= 0) return { shares: 0, cost: 0 };
  let low = 0;
  let high = costAmount * 2; // upper bound: cost >= shares * min_price, so shares <= cost / min_price
  const n = q.length;
  const maxIter = 100;
  for (let iter = 0; iter < maxIter; iter++) {
    const mid = (low + high) / 2;
    const c = costToBuy(q, b, outcomeIndex, mid);
    if (Math.abs(c - costAmount) < tolerance) {
      return { shares: mid, cost: c };
    }
    if (c < costAmount) low = mid;
    else high = mid;
  }
  const shares = (low + high) / 2;
  return { shares, cost: costToBuy(q, b, outcomeIndex, shares) };
}

/**
 * Cost to sell `shares` of outcome at index `outcomeIndex` (negative cost = payout to user).
 * @param {number[]} q - current quantities
 * @param {number} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number} shares - number of shares to sell
 * @returns {number} - positive = user pays, negative = user receives
 */
function costToSell(q, b, outcomeIndex, shares) {
  if (shares <= 0) return 0;
  const qNew = q.slice();
  const current = qNew[outcomeIndex] || 0;
  qNew[outcomeIndex] = Math.max(0, current - shares);
  return cost(qNew, b) - cost(q, b); // negative when selling
}

module.exports = {
  cost,
  marginalPrices,
  costToBuy,
  sharesForCost,
  costToSell,
};
