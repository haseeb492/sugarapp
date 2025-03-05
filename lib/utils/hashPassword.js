import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  const saltRounds = 10; // Adjust for security/performance
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};
