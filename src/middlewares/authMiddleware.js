import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {Session} from "../models/sessionModel.js"; 

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;


export const authenticateUser = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw createHttpError(401, "Authorization header is missing");
  }

  const token = authorization.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = { userId: decoded.userId }; 
    next();
  } catch (error) {
    throw createHttpError(401, "Unauthorized");
  }
};
