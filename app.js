//jshint esversion:6
require('dotenv').config();
const express= require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const app= express();

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const encrypt= require("mongoose-encryption");
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// long string secret helps in using the mongoose-encryption package. 
// To be defined and pluggin before making the mongoose model.
userSchema.plugin(encrypt,{secret: process.env.SECRETSTRING ,encryptedFields: ["password"]});

const User= new mongoose.model("User",userSchema);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

// Observe there's no get request for the secrets route,
// because we don't want anyone to access this page unless logged-in/ registered.

app.post("/register",function(req,res){
    const newUser= new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(err){
        if(!err){
            res.render("secrets");
        }
        else{
            console.log(err);
        }
    });
});

app.post("/login",function(req,res){
    const username= req.body.username;
    const password= req.body.password;
    User.findOne(
        {email: username},
        function(err,foundUser){
            if(err){
                console.log(err);
            }
            else{
                if(foundUser){
                    if(foundUser.password === password){
                        res.render("secrets");
                    }
                    else console.log("Enter correct password");
                }
            }
        }
    )
})

app.listen(3000,function(){
    console.log("Started server on port 3000");
})