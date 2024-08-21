// Import necessary modules
const express = require("express");
const session = require("express-session");
const connectToMongo = require("./db");
const authRoutes = require("./routes/authRoutes");
const adminLoginRoutes = require("./routes/adminLoginRoutes");
const expressEjsLayouts = require("express-ejs-layouts");
const app = express();
const port = 3000;
const rentRoutes = require("./routes/rentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const fetchReviewRoutes = require("./routes/fetchReviewRoutes");
const rentDetailsRoutes = require("./routes/rentDetailsRoutes");
const displayRentDetails = require("./routes/displayRentDetails");
const adminPageRoutes = require("./routes/adminPageRoutes");
const adminUpdate = require("./routes/adminUpdate");
const notifications = require("./routes/notifications");

// Set up session middleware
app.use(
  session({
    secret: "Shashank",
    resave: false,
    saveUninitialized: false,
  })
);

// Connect to MongoDB
connectToMongo();

// Serve static files
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/img", express.static(__dirname + "/public/img"));

// Set view engine and body parser middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Render page function
const renderPage = (route, file, props) => {
  app.get(route, async (req, res) => {
    try {
      const userData = req.session.user;
      res.render(file, { ...props, user: userData });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
};

// Render pages (unchanged)
renderPage("/", "index");
renderPage("/about", "about");
renderPage("/contact", "contact");
renderPage("/faqs", "faqs");
renderPage("/futureBikes", "futureBikes");
renderPage("/futureCars", "futureCars");
renderPage("/latestBikes", "latestBikes");
renderPage("/latestCars", "latestCars");
renderPage("/rent", "rent");
renderPage("/reviewBikes", "reviewBikes");
renderPage("/reviews", "reviews");
renderPage("/trendingBikes", "trendingBikes");
renderPage("/trendingCars", "trendingCars");
renderPage("/update", "update");
renderPage("/accountDetails", "accountDetails");
renderPage("/updateDetails", "updateDetails");
renderPage("/rentResults", "rentResults");
renderPage("/reviewPosting", "reviewPosting");
renderPage("/rentNow", "rentNow");
renderPage("/adminLogin", "adminLogin");
renderPage("/adminSignup", "adminSignup");
renderPage("/adminPage", "adminPage");
renderPage("/notifications", "notifications");
renderPage("/buyNow", "buyNow");

// Routes
app.use(authRoutes);
app.use(adminLoginRoutes);
app.use(rentRoutes);
app.use(reviewRoutes);
app.use("/", fetchReviewRoutes);
app.use(rentDetailsRoutes);
app.use(displayRentDetails);
app.use(adminPageRoutes);
app.use(adminUpdate);
app.use(notifications);

// // Start server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
