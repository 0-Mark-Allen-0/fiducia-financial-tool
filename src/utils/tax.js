/**
 * Constants for FY 2025-26 New Tax Regime
 */
const STANDARD_DEDUCTION = 75000;
const CESS_RATE = 0.04;
const REBATE_LIMIT = 1200000; // Taxable income up to 12L is tax-free u/s 87A

/**
 * Calculates total income tax based on the New Regime (FY 2025-26).
 * * @param {number} grossIncome - The annual gross salary.
 * @returns {number} - Total tax payable (including 4% Cess).
 */
export const calculateNewRegimeTax = (grossIncome) => {
  if (!grossIncome || grossIncome <= 0) return 0;

  // 1. Apply Standard Deduction
  const taxableIncome = Math.max(0, grossIncome - STANDARD_DEDUCTION);

  // 2. Section 87A Rebate: Zero tax if taxable income <= 12 Lakhs
  // (Note: Gross income effectively <= 12.75 Lakhs is tax-free)
  if (taxableIncome <= REBATE_LIMIT) {
    return 0;
  }

  // 3. Calculate Tax Slabs
  let tax = 0;

  // 0 - 4L: Nil
  
  // 4L - 8L: 5%
  if (taxableIncome > 400000) {
    tax += Math.min(taxableIncome - 400000, 400000) * 0.05;
  }

  // 8L - 12L: 10%
  if (taxableIncome > 800000) {
    tax += Math.min(taxableIncome - 800000, 400000) * 0.10;
  }

  // 12L - 16L: 15%
  if (taxableIncome > 1200000) {
    tax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
  }

  // 16L - 20L: 20%
  if (taxableIncome > 1600000) {
    tax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
  }

  // 20L - 24L: 25%
  if (taxableIncome > 2000000) {
    tax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
  }

  // > 24L: 30%
  if (taxableIncome > 2400000) {
    tax += (taxableIncome - 2400000) * 0.30;
  }

  // 4. Add Health & Education Cess (4%)
  return tax * (1 + CESS_RATE);
};

/**
 * Returns the Marginal Tax Rate (including Cess) for a given income.
 * This is used to tax the 'Taxable Bucket' interest in the EPF Shadow Ledger.
 * * @param {number} grossIncome - The annual gross salary.
 * @returns {number} - The effective marginal rate (e.g., 0.312 for 30% slab + cess).
 */
export const getMarginalTaxRate = (grossIncome) => {
  const taxableIncome = Math.max(0, grossIncome - STANDARD_DEDUCTION);

  // If income is within the rebate limit, marginal tax on interest is effectively 0
  // (unless the interest pushes them over the limit) 
  // But for simplicity in Shadow Ledger, we use the salary's base slab).
  if (taxableIncome <= REBATE_LIMIT) return 0;

  let slabRate = 0;

  if (taxableIncome > 2400000) slabRate = 0.30;
  else if (taxableIncome > 2000000) slabRate = 0.25;
  else if (taxableIncome > 1600000) slabRate = 0.20;
  else if (taxableIncome > 1200000) slabRate = 0.15;
  else if (taxableIncome > 800000) slabRate = 0.10;
  else if (taxableIncome > 400000) slabRate = 0.05;

  return slabRate * (1 + CESS_RATE);
};