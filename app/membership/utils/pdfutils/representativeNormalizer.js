// Representative data normalization utilities

// Normalize representatives array
export const normalizeRepresentatives = (app) => {
  let reps = app.representatives || app.reps || [];

  // IC uses singular 'representative' field
  if (!reps || reps.length === 0) {
    if (app.representative) {
      reps = [app.representative];
    }
  }

  if (!Array.isArray(reps)) {
    reps = reps ? [reps] : [];
  }

  return reps;
};
