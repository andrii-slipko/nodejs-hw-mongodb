import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import { emailSchema, registerSchema, loginSchema, resetPasswordSchema } from "../models/authSchemas.js";
import dotenv from "dotenv";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
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

  const sessionId = uuidv4();
  const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId: user._id, sessionId }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

  await Session.deleteMany({ userId: user._id });

  await Session.create({
    userId: user._id,
    sessionId,
    refreshToken,
    accessToken,
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // Додаємо час життя accessToken
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    status: 200,
    message: "Login successful",
    data: { accessToken },
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

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, JWT_SECRET, APP_DOMAIN } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export const sendResetEmail = ctrlWrapper(async (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) throw createHttpError(400, error.details[0].message);

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, "User not found!");

  const token = jwt.sign({ email: user.email }, JWT_SECRET, {
    expiresIn: '5m', 
  });

  const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

  const mailOptions = {
    from: SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      status: 200,
      message: "Reset password email has been successfully sent.",
      data: {},
    });
  } catch (error) {
    throw createHttpError(500, "Failed to send the email, please try again later.");
  }
});

export const resetPassword = ctrlWrapper(async (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);  
  if (error) throw createHttpError(400, error.details[0].message);

  const { password, token } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw createHttpError(401, "Token is expired or invalid.");
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  user.password = await bcrypt.hash(password, 10); 
  await user.save();

  res.status(200).json({ status: 200, message: "Password has been successfully reset.", data: {} });
});

