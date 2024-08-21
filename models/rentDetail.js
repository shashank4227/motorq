const mongoose = require("mongoose");

// Define the RentDetails schema
const rentDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  make: {
    type: String,
  },
  model: {
    type: String,
  },
  carId: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
    trim: true,
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  dropoffDate: {
    type: Date,
    required: true,
  },
  drivingLicense: {
    type: String, // Path to the uploaded driving license image
    required: false,
  },
  yourAddress: {
    type: String,
    required: false,
    trim: true,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
});

// Create the RentDetails model
const RentDetails = mongoose.model("RentDetails", rentDetailsSchema);

module.exports = RentDetails;
