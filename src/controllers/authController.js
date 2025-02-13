import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import { registerSchema, loginSchema } from "../models/authSchemas.js";
import dotenv from "dotenv";
import ctrlWrapper from "../utils/ctrlWrapper.js";
dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const registerUser = ctrlWrapper(async (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, "Email in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      status: res.statusCode,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
});

export const loginUser = ctrlWrapper(async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, "Invalid email or password");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw createHttpError(401, "Invalid email or password");

    const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    await Session.deleteMany({ userId: user._id });

    await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: res.statusCode,
      data: { accessToken, refreshToken },
    });
});

export const refreshToken = ctrlWrapper(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createHttpError(401, "Unauthorized");

    const session = await Session.findOne({ refreshToken });
    if (!session) throw createHttpError(401, "Unauthorized");

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_ACCESS_SECRET, { expiresIn: "15m" });

    session.accessToken = newAccessToken;
    session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    await session.save();

    return res.status(200).json({
      status: res.statusCode,
      data: { accessToken: newAccessToken },
    });
});

export const logoutUser = ctrlWrapper(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
      res.clearCookie("refreshToken");
    }
    return res.status(204).send();
});
