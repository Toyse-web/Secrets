//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyPerser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyPerser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

console.log(process.env.API_KEY);
const secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
            console.log("Error while hashing password", err);
            return res.status(500).send("Error processing request");
        } 
        
        const newUser = new User ({
        email: req.body.username,
        password: hash
    });
    
    newUser.save()
    .then(() => {
        res.render("secrets");
    })
    .catch(saveErr => {
        console.log("Error saving user", saveErr);
        res.status(500).send("Error saving user");
    });
});
});


app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({email: username});

        if (!foundUser) {
            return res.status(401).send("User not found");
        } 

        const match = await bcrypt.compare(password, foundUser.password);
        if (match) {
            res.render("secrets");
        } else {
            res.status(401).send("Incorrect password");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Error");
    }
});



const port = 3000;
app.listen(port, function () {
    console.log(`Server running on port ${port}`)
});

