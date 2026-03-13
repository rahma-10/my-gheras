const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const passport = require("passport");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(passport.initialize());

// Routes
// Users, Payments, Plants, Fertilizers, Diseases
let usersRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const plantRoutes = require("./routes/plant");
const fertilizerRoutes = require("./routes/fertilize");
const diseaseRoutes = require("./routes/disease");

app.use("/users", usersRoutes);
app.use("/plants", plantRoutes);
app.use("/fertilizers", fertilizerRoutes);
app.use("/diseases", diseaseRoutes);
app.use("/api", paymentRoutes); // API Payments

// Blogs
const blogRoutes = require("./routes/blogRoutes");
app.use("/api", blogRoutes); // API Blogs

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `${req.url} Not Found` });
});

// MongoDB connection
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI, {
  
})
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("Connection error:", err.message);
    });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});