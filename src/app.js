const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()

//dealing with middle ware
app.use(cors({
    origin : process.env.CORS_ORIGIN, //origin means what link are we going to allow to use the backend
    //so basically it will be the link of the frontend
    credentials: true
    //this means that the origin url can call your backend APIs
    //and at the same time browser can also send authentication data like cookies or login info etc
}))

//to deal with the json request or response that we can send or receive
app.use(express.json(
    {
        limit: "16kb" //limit the number of json files we can accept or send 
    }
))

//frontend can send data in different ways
//the data can be accessed using req.body
//if it sends in the way of json then express.json is used
//but if it sends in the data which is gathered in html forms (suppose when we search something)
//then it is not in json format but an encoded format
//so we cannot use req.body to directly access the data 
//hence we use a seperate middleware for that 
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

//so incase we upload files and we want to keep them stored on our server
//then we use this to create a public folder
app.use(express.static("public"))

//middleware used to read cookies sent by the browser and make them available when we use the function
//req.cookies
//cookies => basic data about the user that the browser stores (login info, session id, 
//user pref(dark mode etc))
app.use(cookieParser)

export {app}