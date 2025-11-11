// Basic HTML builder functions

// Create field HTML
export const field = (label, value, style = "") =>
  `<div class="field" ${style}><span class="label">${label}:</span> <span class="value">${value || "-"}</span></div>`;

// Create section HTML
export const section = (title, content) =>
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;
