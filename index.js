const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

let usersRoutes = require('./routes/user')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); 
app.use('/users', usersRoutes)


app.use((req, res)=>{
    res.status(404).json({message:`${req.url} Not Found`})
})


const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => {
        console.log("Connected to MongoDB Atlas successfully!");
    })
    .catch((err) => {
        console.error("Connection error:", err.message);
    });

app.get('/', (req, res) => {
    res.send('Welcome to my backend project, Hamoudi!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});