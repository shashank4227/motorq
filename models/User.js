const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  customerId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  contact: { type: String },
  drivingLicenseImage: { type: String }, // Store image path
  price: { type: Number },
  duration: { type: Number },
  password: { type: String, required: true },
});

// Password hashing before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
