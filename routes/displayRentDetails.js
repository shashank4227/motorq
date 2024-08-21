const express = require("express");
const bodyParser = require("body-parser");
const RentDetails = require("../models/rentDetail");
const moment = require("moment");
const nodemailer = require("nodemailer");
const Car = require("../models/Car");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to get rented vehicles for a user
app.get("/rented-vehicles/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch rented vehicles for the user
    const userVehicles = await RentDetails.find({ name: username });

    // Check if user has any rented vehicles
    if (userVehicles.length === 0) {
      return res.status(404).render("accountDetails", {
        user: { username },
        userVehicles: [],
        error: "No rented vehicles found for this user.",
      });
    }

    // Check if the current date is past the dropoff date for each vehicle
    const now = moment();
    userVehicles.forEach((vehicle) => {
      vehicle.canRate = now.isAfter(moment(vehicle.dropoffDate));
    });
    userVehicles.forEach((vehicle) => {
      vehicle.inTrip = now.isAfter(moment(vehicle.pickupDate));
    });
    // Render the EJS template with user and vehicle data
    res.render("rentedVehicles", {
      user: { username },
      userVehicles,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to rate a vehicle
app.post("/rate-vehicle/:vehicleName", async (req, res) => {
  try {
    const { vehicleName } = req.params;
    const { rating, username } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Find the rental details for the specified vehicle
    const rentDetail = await RentDetails.findOne({
      carId: vehicleName,
      name: username,
    });

    // Check if the vehicle exists and if the dropoff date has passed
    if (!rentDetail) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (!moment().isAfter(moment(rentDetail.dropoffDate))) {
      return res
        .status(400)
        .json({ error: "You can only rate after the dropoff date" });
    }

    // Update the rating for the specific vehicle
    rentDetail.rating = rating;
    await rentDetail.save();

    // Redirect back to the user's rented vehicles page
    res.redirect(`/rented-vehicles/${username}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "yourwheels123@gmail.com",
    pass: "fjbd wpjz xhqa ezoa",
  },
});

app.post("/cancel-booking/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { username } = req.body;
    let { email } = req.body;
    console.log(email);
    // Find and remove the booking from RentDetails
    const rentDetail = await RentDetails.findOneAndDelete({
      carId: vehicleId,
      name: username,
    });

    if (!rentDetail) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update the Car model to set isBooked to false
    await Car.findByIdAndUpdate(vehicleId, { isBooked: false });

    // Send email notification to the admin
    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Booking Cancellation Request",
      text: `A booking has been canceled by ${username} for vehicle ID ${vehicleId}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Failed to send email notification" });
      }
      console.log("Email sent:", info.response);
    });

    res.redirect(`/rented-vehicles/${username}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
