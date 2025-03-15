export const predictSugar = async (
  calories,
  currentSugar,
  insolineDosage = 0
) => {
  try {
    return 200;
  } catch (error) {
    throw new Error(
      error.message || "Something went wrong in predictSugar helper function"
    );
  }
};
