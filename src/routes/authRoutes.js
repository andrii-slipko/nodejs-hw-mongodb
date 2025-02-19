import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser, sendResetEmail, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.post("/send-reset-email", sendResetEmail);
router.post("/reset-pwd", resetPassword);

export default router;