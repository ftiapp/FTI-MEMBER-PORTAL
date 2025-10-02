export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone) => {
  const cleaned = phone?.replace(/\D/g, "");
  return cleaned?.length >= 9 && cleaned?.length <= 10;
};

export const isValidIdCard = (idCard) => {
  const cleaned = idCard?.replace(/\D/g, "");
  return cleaned?.length === 13;
};

export const isValidTaxId = (taxId) => {
  const cleaned = taxId?.replace(/\D/g, "");
  return cleaned?.length === 13;
};
