import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    cartItems: { type: Object, default: {} },
    profileImage: { type: String, default: "" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    otp: { type: String },
    otpExpire: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.model("User", userSchema);
export default User;
