/**
 * Token math utilities for precise handling of fractional tokens.
 * LMSR calculations often produce fractional token amounts (e.g., 10.7 tokens).
 * We track integer and fractional parts separately to maintain conservation laws.
 */

/**
 * Split a decimal amount into integer and fractional parts.
 * @param {number} amount - The amount to split
 * @returns {{ integer: number, fraction: number }} integer part and fractional part (0 <= fraction < 1)
 */
function splitTokenAmount(amount) {
  const integer = Math.floor(amount);
  const fraction = amount - integer;
  return { integer, fraction };
}

/**
 * Add a token amount to a user's balance, handling fractional parts.
 * Returns { tokenBalance, tokenFraction } to update in DB.
 * @param {number} currentBalance - user's current token_balance (integer)
 * @param {number} currentFraction - user's current token_fraction (0 <= x < 1)
 * @param {number} addAmount - amount to add (can be fractional)
 * @returns {{ tokenBalance: number, tokenFraction: number }}
 */
function addTokens(currentBalance, currentFraction, addAmount) {
  const { integer: addInt, fraction: addFrac } = splitTokenAmount(addAmount);
  let newFraction = currentFraction + addFrac;
  let newBalance = currentBalance + addInt;

  // If fraction >= 1, move to balance
  if (newFraction >= 1) {
    const carryover = Math.floor(newFraction);
    newBalance += carryover;
    newFraction -= carryover;
  }

  return {
    tokenBalance: newBalance,
    tokenFraction: Math.min(newFraction, 0.99999999), // Prevent floating point errors pushing past 1
  };
}

/**
 * Subtract a token amount from a user's balance, handling fractional parts.
 * Returns { tokenBalance, tokenFraction } to update in DB.
 * Throws if insufficient balance.
 * @param {number} currentBalance - user's current token_balance (integer)
 * @param {number} currentFraction - user's current token_fraction (0 <= x < 1)
 * @param {number} subtractAmount - amount to subtract (can be fractional)
 * @returns {{ tokenBalance: number, tokenFraction: number }}
 */
function subtractTokens(currentBalance, currentFraction, subtractAmount) {
  if (subtractAmount < 0) throw new Error("Cannot subtract negative amount");

  const { integer: subInt, fraction: subFrac } = splitTokenAmount(subtractAmount);
  let newFraction = currentFraction - subFrac;
  let newBalance = currentBalance - subInt;

  // If fraction < 0, borrow from balance
  if (newFraction < 0) {
    newBalance -= 1;
    newFraction += 1;
  }

  // Check sufficient balance
  if (newBalance < 0 || (newBalance === 0 && newFraction < 0)) {
    throw new Error("Insufficient token balance");
  }

  return {
    tokenBalance: newBalance,
    tokenFraction: Math.max(newFraction, 0),
  };
}

/**
 * Get the total token value (balance + fraction) as a single number.
 * @param {number} balance - integer balance
 * @param {number} fraction - fractional balance
 * @returns {number} total tokens
 */
function getTotalTokens(balance, fraction) {
  return balance + fraction;
}

/**
 * Check if user has sufficient tokens (accounting for fractional part).
 * @param {number} balance - integer balance
 * @param {number} fraction - fractional balance
 * @param {number} requiredAmount - amount needed
 * @returns {boolean}
 */
function hasSufficientTokens(balance, fraction, requiredAmount) {
  const total = getTotalTokens(balance, fraction);
  return total >= requiredAmount - 1e-8; // Small epsilon for floating point comparison
}

module.exports = {
  splitTokenAmount,
  addTokens,
  subtractTokens,
  getTotalTokens,
  hasSufficientTokens,
};
