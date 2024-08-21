const express = require("express");
const { v4: uuidv4 } = require("uuid"); // Import uuidv4 function
const User = require("../models/User"); // Assuming you have a User model defined
const Car = require("../models/Car");
const router = express.Router();

// Routes
router.get("/adminPageUsers", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.render("adminPage", { users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/add-car", (req, res) => {
  res.render("add-car");
});

// Add Car - POST
router.post("/add-car", async (req, res) => {
  const {
    make,
    model,
    year,
    registrationNumber,
    fuelType,
    rentRange,
    licenseNumber,
    location,
  } = req.body;

  const newCar = new Car({
    carId: uuidv4(), // Generate a unique UUID for the car
    make,
    model,
    year,
    registrationNumber,
    fuelType,
    rentRange,
    licenseNumber,
    location,
  });

  try {
    await newCar.save();
    res.redirect("/cars");
  } catch (err) {
    console.error("Error adding car:", err);
    res.status(500).send("Internal Server Error");
  }
});

// View All Cars
router.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    res.render("adminPage", { cars });
  } catch (err) {
    console.error("Error fetching cars:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Edit Car - GET
router.get("/edit-car/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send("Car not found");
    }
    res.render("edit-car", { car });
  } catch (err) {
    console.error("Error fetching car:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Edit Car - POST
router.post("/edit-car/:id", async (req, res) => {
  const {
    make,
    model,
    year,
    registrationNumber,
    fuelType,
    rentRange,
    licenseNumber,
    location,
    customerId,
  } = req.body;

  try {
    await Car.findByIdAndUpdate(req.params.id, {
      make,
      model,
      year,
      registrationNumber,
      fuelType,
      rentRange,
      licenseNumber,
      location,
      customerId,
    });
    res.redirect("/cars");
  } catch (err) {
    console.error("Error updating car:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Search Cars
router.get("/searchCarByAdmin", async (req, res) => {
  const { make, model, year, registrationNumber } = req.query;
  let query = {};

  // Build the query based on inputs
  if (make) query.make = new RegExp(make.trim(), "i"); // case-insensitive search
  if (model) query.model = new RegExp(model.trim(), "i");
  if (year) query.year = parseInt(year);

  // Handle Registration Number search - exact match or partial match
  if (registrationNumber) {
    query.registrationNumber = new RegExp(registrationNumber.trim(), "i");
  }

  try {
    // Execute the query
    const cars = await Car.find(query);
    res.render("adminPage", { cars });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred during the search");
  }
});

// Delete Car
router.post("/delete-car/:id", async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.redirect("/cars");
  } catch (err) {
    console.error("Error deleting car:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
