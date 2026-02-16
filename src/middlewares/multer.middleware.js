const multer = require('multer')

//multer has a function called diskStorage
//tells multer to store uploaded files on my computer and not in memory

//as an argument it accepts an object
const storage = multer.diskStorage({

    //first attribute is destination(also a function)
    destination: function (req, file, cb){
        //this function defines where the uploaded file should be saved
        //takes 3 params:
        //req -> contains form data, user info, etc
        //file -> info about the uploaded file
        //cb -> callback function

        cb(null, " ./public/temp")
        //null means no errors
        //second arg -> folder path where files should be saved
    },

    //second attribute is filename(also a function)
    filename : function (req, file, cb){
        //this function decides what the file should be named

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        //this creates a unique number to prevent file name collisions
        
        cb(null, file.fieldname + '-' + uniqueSuffix)
        //file.fieldname -> name of the input field in your form
        //suppose html code looks like this:
        //<input type = "file" name = "profilePic"> then the file.fieldname = "profilePic"
        //so your filename will be profilePic-013r0ur0u10293fn(ie. unique suffix)

    }
})

export const upload = multer({
    storage, //we have exported our storage function
    //everytime we want to upload something we use this middleware
})