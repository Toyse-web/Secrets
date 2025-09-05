//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyPerser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

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

console.log(md5("123456"));


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
    const newUser = new User ({
        email: req.body.username,
        password: md5(req.body.password)
    });

    try {
        newUser.save();
        console.log(err);
    } catch {
        res.render("secrets");
    }
});


app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);

    try {
        const foundUser = await User.findOne({email: username});

        if (!foundUser) {
            return res.status(401).send("User not found");
        } 
        if (foundUser.password !== password) {
                return res.status(401).send("Incorrect password");
        }

        return res.render("secrets");

    } catch (err) {
        console.log(err);
    }
});



const port = 3000;
app.listen(port, function () {
    console.log(`Server running on port ${port}`)
});

