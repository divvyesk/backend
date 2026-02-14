const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required : true,
        unique: true,
        lowercase: true,
        trim : true,
        index : true,  //if you want to search a particular field then mark index as true
    },

    email:{
        type: String,
        required : true,
        unique: true,
        lowercase: true,
        trim : true,
    },

    fullname:{
        type: String,
        required : true,
        trim : true,
        index : true,
    },

    avatar: { //pfp of the user
        type: String, //cloudinary url
        required: true,
    }, 

    coverImage: {
        type: String,
    },


    //array of all the videos that you have watched
    //each object is referenced from the video.models.js file
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    password: {
        type: String, 
        required: [true, "Password is required"]
    },

    refreshToken: {
        type: String, 
    }

},{timestamps: true})

userSchema.pre("save", async function(next) { //in the get request we had, req, res and next
    //this is that next

    if(!this.isModified("password")) return next


    this.password = bcrypt.hash(this.password, 10) //hash function will encrypt the password
    //it will take 2 arguments: password and the no of rounds 
    
    next()

    //the problem here is that this function will keep changing the password everytime something
    //in the schema is changed & saved (like avatar or coverimage)
    //so we have build the function such that this function runs only when the password is changed
    //for that we use an if condition
})

userSchema.methods.isPasswordCorrect = async function (password) {
    //isCorrectPassword is the name that we have given to our new method
    //this will always check if the password is correct when the user logs in

    //to check if the password is correct we use a bcrypt function compare
    return await bcrypt.compare(password, this.password) 
    //takes 2 arguments: password sent by the user, encrypted password
    //this function may take time hence it we use await
    //the compare function will return a boolean value
    
}


userSchema.methods.generateAccessToken = function() {
    //we use the jwt method called sign which will generate our reqd token
    //return used to return the token
    return jwt.sign(
        { //1. payload
            _id : this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },

        process.env.ACCESS_TOKEN_SECRET,  //2. secret key

        {   //3. expiry of the token
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function() {
    //generated in the same way as refresh token

    return jwt.sign(
        { //1. payload
            _id : this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },

        process.env.ACCESS_TOKEN_SECRET,  //2. secret key

        {   //3. expiry of the token
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)