const Decimal = require("decimal.js");

/**
 * Logarithmic Market Scoring Rule (LMSR) — using Decimal.js for precise math.
 * See: Gnosis LMSR primer, Oddhead blog, README links.
 *
 * Cost: C(q) = b * ln(sum_i exp(q_i / b))
 * Marginal price (probability) of outcome i: P_i = exp(q_i/b) / sum_k exp(q_k/b)
 * Cost to move from q to q': cost = C(q') - C(q)
 */

// Set Decimal precision to 20 significant digits for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * LMSR cost function using Decimal.js for precision.
 * @param {(number|Decimal)[]} q - quantities per outcome
 * @param {number|Decimal} b - liquidity parameter
 * @returns {Decimal}
 */
function cost(q, b) {
  const bDec = new Decimal(b);
  if (bDec.lte(0)) throw new Error("LMSR: b must be positive");
  const n = q.length;
  if (n === 0) return new Decimal(0);
  
  let sum = new Decimal(0);
  for (let i = 0; i < n; i++) {
    const qi = new Decimal(q[i] || 0);
    sum = sum.plus(Decimal.exp(qi.dividedBy(bDec)));
  }
  return bDec.times(Decimal.ln(sum));
}

/**
 * Marginal price (probability) for each outcome. Sum of returned array = 1.
 * @param {(number|Decimal)[]} q - quantities per outcome
 * @param {number|Decimal} b - liquidity parameter
 * @returns {Decimal[]}
 */
function marginalPrices(q, b) {
  const bDec = new Decimal(b);
  if (bDec.lte(0)) throw new Error("LMSR: b must be positive");
  const n = q.length;
  if (n === 0) return [];
  
  let sumExp = new Decimal(0);
  const expQ = q.map((qi) => {
    const qDec = new Decimal(qi || 0);
    const e = Decimal.exp(qDec.dividedBy(bDec));
    sumExp = sumExp.plus(e);
    return e;
  });
  return expQ.map((e) => e.dividedBy(sumExp));
}

/**
 * Cost to buy `shares` of outcome at index `outcomeIndex` (0-based).
 * @param {(number|Decimal)[]} q - current quantities
 * @param {number|Decimal} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number|Decimal} shares - number of shares to buy
 * @returns {Decimal}
 */
function costToBuy(q, b, outcomeIndex, shares) {
  const sharesDec = new Decimal(shares);
  if (sharesDec.lte(0)) return new Decimal(0);
  const qNew = q.map((x) => new Decimal(x || 0));
  qNew[outcomeIndex] = qNew[outcomeIndex].plus(sharesDec);
  return cost(qNew, b).minus(cost(q, b));
}

/**
 * How many shares of outcome at `outcomeIndex` can be bought for `costAmount` tokens.
 * Uses binary search (cost is increasing in shares).
 * @param {(number|Decimal)[]} q - current quantities
 * @param {number|Decimal} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number|Decimal} costAmount - tokens to spend
 * @param {number} [tolerance=1e-9] - stop when cost error is below this
 * @returns {{ shares: Decimal, cost: Decimal }}
 */
function sharesForCost(q, b, outcomeIndex, costAmount, tolerance = 1e-9) {
  const costAmountDec = new Decimal(costAmount);
  if (costAmountDec.lte(0)) return { shares: new Decimal(0), cost: new Decimal(0) };
  
  let low = new Decimal(0);
  let high = costAmountDec.times(2);
  const toleranceDec = new Decimal(tolerance);
  const maxIter = 150;
  
  for (let iter = 0; iter < maxIter; iter++) {
    const mid = low.plus(high).dividedBy(2);
    const c = costToBuy(q, b, outcomeIndex, mid);
    const diff = c.minus(costAmountDec).abs();
    
    if (diff.lte(toleranceDec)) {
      return { shares: mid, cost: c };
    }
    if (c.lt(costAmountDec)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  const sharesResult = low.plus(high).dividedBy(2);
  return { shares: sharesResult, cost: costToBuy(q, b, outcomeIndex, sharesResult) };
}

/**
 * Cost to sell `shares` of outcome at index `outcomeIndex` (negative cost = payout to user).
 * @param {(number|Decimal)[]} q - current quantities
 * @param {number|Decimal} b - liquidity parameter
 * @param {number} outcomeIndex - index of outcome (0-based)
 * @param {number|Decimal} shares - number of shares to sell
 * @returns {Decimal} - negative when selling (user receives tokens)
 */
function costToSell(q, b, outcomeIndex, shares) {
  const sharesDec = new Decimal(shares);
  if (sharesDec.lte(0)) return new Decimal(0);
  const qNew = q.map((x) => new Decimal(x || 0));
  const currentQi = qNew[outcomeIndex];
  const newQi = currentQi.minus(sharesDec);
  qNew[outcomeIndex] = Decimal.max(new Decimal(0), newQi);
  return cost(qNew, b).minus(cost(q, b));
}

module.exports = {
  cost,
  marginalPrices,
  costToBuy,
  sharesForCost,
  costToSell,
  Decimal, // Export Decimal class for use in services
};

