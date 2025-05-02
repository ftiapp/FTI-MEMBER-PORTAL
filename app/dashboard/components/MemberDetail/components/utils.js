/**
 * Formats a date string to Thai Buddhist Era (BE) format (DD/MM/YYYY)
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string or '-' if dateString is falsy
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // Convert to Buddhist Era (BE)
    return `${day}/${month}/${year}`;
  };