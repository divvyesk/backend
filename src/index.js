require('dotenv').config()

const express = require("express");
const mongoose = require("mongoose");
const { DB_NAME } = require('./constants');

const app = express();


( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error", (error)=> {
            console.log("Error: ", error)
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log("Server is listening to requests on port: ", process.env.PORT)
        })

    } catch (error) {
        console.log("Error: ", error)
    }
})()