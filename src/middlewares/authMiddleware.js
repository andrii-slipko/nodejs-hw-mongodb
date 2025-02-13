import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {Session} from "../models/sessionModel.js"; 

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Unauthorized: Токен не надано");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    const session = await Session.findOne({ userId: decoded.userId, accessToken: token });
    if (!session) {
      throw createHttpError(401, "Unauthorized: Активну сесію не знайдено");
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next(createHttpError(401, "Unauthorized: Токен протерміновано"));
    } else if (err.name === "JsonWebTokenError") {
      next(createHttpError(401, "Unauthorized: Невірний токен"));
    } else {
      next(createHttpError(401, "Unauthorized"));
    }
  }
};