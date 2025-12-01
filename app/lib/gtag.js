export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Record a pageview
export const pageview = (url) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Record a custom event
export const gaEvent = ({ action, category, label, value }) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
