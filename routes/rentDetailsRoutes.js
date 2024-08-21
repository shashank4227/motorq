const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const RentDetails = require("../models/rentDetail");
const Car = require("../models/Car");
const nodemailer = require("nodemailer");

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "yourwheels123@gmail.com",
    pass: process.env.SMTP_PASS || "fjbd wpjz xhqa ezoa",
  },
});

router.get("/rentNow/:carId", async (req, res) => {
  try {
    const { carId } = req.params;

    // Find the car by ID
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).send("Car not found.");
    }

    // Render a page or redirect to a rental form with car details
    // Here, we'll render a rental form with the car details
    res.render("rentNow", {
      carId,
    });
  } catch (error) {
    console.error("Error processing rental request:", error);
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/submit-rent-details",
  upload.fields([{ name: "drivingLicense", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        phoneNumber,
        name,
        email,
        pickupLocation,
        dropoffLocation,
        carId,
        make,
        model,
      } = req.body;
      const drivingLicensePath = req.files["drivingLicense"]?.[0]?.path || null;

      const customerId = `CUST-${Date.now()}`;

      // Convert pickupDate and dropoffDate to Date objects
      const pickupDate = new Date(req.body["pickup-date"]);
      const dropoffDate = new Date(req.body["dropoff-date"]);

      // Check if dates are valid
      if (isNaN(pickupDate.getTime()) || isNaN(dropoffDate.getTime())) {
        return res.status(400).send("Invalid date format");
      }

      // Find an available car
      const car = await Car.findOne({ isBooked: false }).sort({ createdAt: 1 });
      if (!car) {
        console.log("No available cars found.");
        return res.status(404).send("No available cars found.");
      }

      // Update the car's booking status
      await Car.findByIdAndUpdate(car._id, {
        isBooked: true,
        customerId,
        bookedFrom: pickupDate,
        bookedTill: dropoffDate,
      });

      // Save rental details
      const newRentDetails = new RentDetails({
        name,
        carId,
        make,
        model,
        phone: phoneNumber,
        email,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        dropoffDate,
        drivingLicense: drivingLicensePath,
        yourAddress: req.body["yourAddress"],
      });

      await newRentDetails.save();
      console.log("Rent details saved successfully:", newRentDetails);

      // Send email
      const mailOptions = {
        from: process.env.SMTP_USER || "yourwheels123@gmail.com",
        to: email,
        subject: "Vehicle Rental Details",
        html: `
          <h1>Thank you for renting a vehicle with us!</h1>
          <p>Here are the details of your rental:</p>
          <ul>
            <li>Name: ${name}</li>
            <li>Phone: ${phoneNumber}</li>
            <li>Email: ${email}</li>
            <li>Pickup Location: ${pickupLocation}</li>
            <li>Drop-off Location: ${dropoffLocation}</li>
            <li>Pickup Date: ${pickupDate.toISOString().split("T")[0]} ${
          pickupDate.toTimeString().split(" ")[0]
        }</li>
            <li>Drop-off Date: ${dropoffDate.toISOString().split("T")[0]} ${
          dropoffDate.toTimeString().split(" ")[0]
        }</li>
            <li>Your Address: ${req.body["yourAddress"]}</li>
          </ul>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");

      res.redirect("/");
    } catch (error) {
      console.error("Error processing rental:", error);
      res.status(500).send("Error processing rental");
    }
  }
);

module.exports = router;
