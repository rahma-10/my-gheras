<<<<<<< HEAD
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
=======
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv'); 
const bodyParser = require('body-parser');
const passport = require('passport');

dotenv.config();

const usersRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
>>>>>>> 0293ef52bc86acebc99d37ced5671eae650b9374
const plantRoutes = require("./routes/plant");
const fertilizerRoutes = require("./routes/fertilize");
const diseaseRoutes = require("./routes/disease");
const dashboardRoutes = require("./routes/dashboard");


// call error handling
const globalError = require('./Middlewares/globalError');
const AppError = require('./utils/appError');

<<<<<<< HEAD
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
=======
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares 
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(passport.initialize()); 


// main route or project 
app.get('/', (req, res) => {
    res.send('Welcome to Gheras backend project!');
});

// routes of departments and features 
app.use('/api/users', usersRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/fertilizers", fertilizerRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/payments', paymentRoutes);


// error not found  404 
app.use((req, res, next) => {
    next(new AppError(`Can not find this route: ${req.originalUrl}`, 404));
});

// Global Error middleware 
app.use(globalError);


// connect to database
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
>>>>>>> 0293ef52bc86acebc99d37ced5671eae650b9374
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