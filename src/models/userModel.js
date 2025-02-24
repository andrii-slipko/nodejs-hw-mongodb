import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);