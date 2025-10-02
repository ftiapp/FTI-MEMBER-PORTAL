export const formatThaiDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543;

  return `${day}/${month}/${year}`;
};

export const formatThaiDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "-";
  return Number(amount).toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  });
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return "-";
  return Number(num).toLocaleString("th-TH");
};

export const formatPercent = (value) => {
  if (!value && value !== 0) return "-";
  return `${Number(value).toFixed(2)}%`;
};
