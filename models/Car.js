const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  carId: {
    type: String,
    unique: true,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  rentRange: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    default: null,
  },

  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedFrom: {
    type: Date,
    default: null,
  },
  bookedTill: {
    type: Date,
    default: null,
  },
  username: {
    type: String,
  },
});

// Adding index on isBooked for performance improvement
CarSchema.index({ isBooked: 1 });

const Car = mongoose.model("Car", CarSchema);

module.exports = Car;
