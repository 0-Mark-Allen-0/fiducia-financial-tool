/**
 * Formats a number into Indian Currency style (e.g., 100000 -> ₹1,00,000)
 * @param {number} num - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Converts large numbers into short Indian units (Lakhs/Crores)
 * @param {number} num - The amount to format
 * @param {boolean} fullSuffix - If true, returns "Lakhs/Crores", else "L/Cr"
 * @returns {string} - e.g., "1.50 Cr" or "1.50 Crores"
 */
export const formatUnit = (num, fullSuffix = false) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  
  const absNum = Math.abs(num);

  if (absNum >= 10000000) {
    return `${(num / 10000000).toFixed(2)} ${fullSuffix ? 'Crores' : 'Cr'}`;
  } 
  
  if (absNum >= 100000) {
    return `${(num / 100000).toFixed(2)} ${fullSuffix ? 'Lakhs' : 'L'}`;
  }

  return "";
};

/**
 * Helper to return a combined string like "(1.50 Cr)" for UI displays
 * @param {number} num 
 * @returns {string}
 */
export const formatCompact = (num) => {
  const unit = formatUnit(num);
  return unit ? `(${unit})` : "";
};

/**
 * Cleans a string for CSV export by removing HTML tags, currency symbols, and commas.
 * @param {string} str - The raw string (potentially containing HTML or symbols)
 * @returns {string} - Clean number/text string
 */
export const cleanForCSV = (str) => {
  if (!str) return "";
  
  // 1. Create a temporary DOM element to strip HTML tags (if any exist in the source)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = str;
  const text = tempDiv.innerText || tempDiv.textContent || "";

  // 2. Remove Rupee symbol, commas, and parentheses content (e.g., "(1.2 Cr)")
  // We keep only the raw digits or basic text
  return text
    .replace(/₹/g, '')       // Remove Rupee
    .replace(/,/g, '')       // Remove Commas (Excel hates them in CSVs)
    .replace(/\(.*?\)/g, '') // Remove (1.2 Cr) suffix if present
    .trim();
};