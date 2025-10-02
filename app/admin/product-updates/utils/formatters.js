/**
 * Format date string to Thai format
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString("th-TH", options);
}

/**
 * Format status to Thai
 * @param {string} status - Status to format
 * @returns {string} - Formatted status
 */
export function formatStatus(status) {
  const statusMap = {
    pending: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธแล้ว",
  };

  return statusMap[status] || status;
}

/**
 * Format status to color
 * @param {string} status - Status to format
 * @returns {string} - Color class
 */
export function getStatusColor(status) {
  const colorMap = {
    pending: "text-yellow-600 bg-yellow-100",
    approved: "text-green-600 bg-green-100",
    rejected: "text-red-600 bg-red-100",
  };

  return colorMap[status] || "text-gray-600 bg-gray-100";
}

/**
 * Format products string to array
 * @param {string} productsString - Products string
 * @returns {Array} - Array of products
 */
export function formatProductsToArray(productsString) {
  if (!productsString) return [];
  return productsString
    .split(",")
    .map((product) => product.trim())
    .filter(Boolean);
}

/**
 * Compare old and new products to highlight differences
 * @param {string} oldProducts - Old products string
 * @param {string} newProducts - New products string
 * @returns {Object} - Comparison result
 */
export function compareProducts(oldProducts, newProducts) {
  const oldArray = formatProductsToArray(oldProducts);
  const newArray = formatProductsToArray(newProducts);

  const added = newArray.filter((product) => !oldArray.includes(product));
  const removed = oldArray.filter((product) => !newArray.includes(product));
  const unchanged = oldArray.filter((product) => newArray.includes(product));

  return {
    added,
    removed,
    unchanged,
    hasChanges: added.length > 0 || removed.length > 0,
  };
}
