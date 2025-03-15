export const calculateCalories = async (foodInput) => {
  try {
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${foodInput}`,
      {
        headers: {
          "X-Api-Key": process.env.CALORIE_API_KEY,
        },
      }
    );
    // Extract the JSON body from the response
    const calorieData = await response.json();
    console.log(calorieData);
    return calorieData;
  } catch (error) {
    throw new Error(
      error.message ||
        "Something went wrong in calculateCalories helper function"
    );
  }
};
