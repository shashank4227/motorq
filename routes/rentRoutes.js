const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Car = require("../models/Car");

// Define the MongoDB connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define a schema for your showroom collection
const rentSchema = new mongoose.Schema({
  query: String,
  location: String,
  address: String,
  type: String,
  path: String,
  fuelType: String,
});
const Rent = mongoose.model("rent", rentSchema);

router.get("/findRent", async (req, res) => {
  try {
    const { make, model, year, fuelType, rentRange } = req.query;

    // Construct query based on the filter inputs
    let query = {};

    if (make) query.make = new RegExp(make, "i"); // Case-insensitive search
    if (model) query.model = new RegExp(model, "i");
    if (year) query.year = year;

    // Check if fuelType is not "all" and is provided
    if (fuelType && fuelType !== "all") {
      query.fuelType = fuelType;
    }

    if (rentRange) query.rentRange = { $lte: rentRange };

    // Fetch cars based on query
    const cars = await Car.find(query);

    // Debugging step: Log cars to see the output
    console.log(cars);

    // Render the template with the fetched cars
    res.render("rentResults", { cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
