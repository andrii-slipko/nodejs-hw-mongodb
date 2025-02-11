import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(createHttpError(401, "Invalid token"));
  }
};