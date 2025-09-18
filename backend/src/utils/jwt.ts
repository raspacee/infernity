import jwt from "jsonwebtoken";

export type JwtUser = {
  id: string;
  email: string;
};

export const generateAccessToken = (user: JwtUser) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "7d" });
};
