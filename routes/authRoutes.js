const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../controller/UserController");
const UserModel = require("../models/User");
const session = require("express-session");
const UserController = require("../controller/UserController");

const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Alert message for frontend
const sendAlert = (res, redirectUrl, alertMessage) => {
  res.redirect(`${redirectUrl}?alert=true&message=${alertMessage}`);
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/accountDetails");
  }
  next();
};

router.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Sign up",
    signupSuccess: req.query.signupSuccess,
    req: req,
  });
});

router.get("/login", isAuthenticated, (req, res) => {
  res.render("login", {
    title: "Log in",
    loginError: req.query.loginError,
    req: req,
    username: req.session.user ? req.session.user.username : null,
  });
});

router.get("/update", (req, res) => {
  res.render("update", {
    title: "Update",
    updateSuccess: req.query.updateSuccess,
    req: req,
    username: req.session.user ? req.session.user.username : null, // Ensure username is passed
  });
});

const multer = require("multer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/drivingLicenses"); // Set upload folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Handle Sign-Up Form Submission with Image Upload
router.post(
  "/signup",
  upload.single("drivingLicenseImage"),
  async (req, res) => {
    const { username, email, contact, price, duration, password } = req.body;

    try {
      // Generate a unique customer ID
      const customerId = uuidv4(); // Generate a UUID as the customer ID

      // Check if user already exists by email
      let existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).send("User with this email already exists.");
      }

      // Create new user with generated customer ID
      const newUser = new UserModel({
        username,
        customerId, // Automatically generated
        email,
        contact,
        price,
        duration,
        password,
      });

      // Save user to the database
      await newUser.save();
      res.redirect("/login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserController.getUserByUsername(username); // Use UserController
    if (!user) {
      return sendAlert(res, "/login", "Invalid username");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendAlert(res, "/login", "Incorrect password");
    }
    req.session.user = user;
    res.redirect("/");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post(
  "/update",
  [
    body("newUsername")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Invalid username"),
    body("newPassword")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
    body("confirmNewPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendAlert(res, "/update", errors.array()[0].msg);
    }

    const { newUsername, newPassword } = req.body;

    try {
      // Get the current user
      const currentUser = req.session.user;

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the user's username and password
      const updatedUser = await User.updateUser(
        currentUser.username,
        newUsername,
        hashedPassword
      );

      req.session.user = updatedUser;

      // Redirect with success message
      res.redirect("/");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
    // Redirect to the login page after logout
    res.redirect("/");
  });
});

module.exports = router;
