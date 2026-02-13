//async handler is a higher order function
//here a function is given as an argument in the async Handler function and the body contains 
//another function 

//so async handler function is required when we write async functions inside app.get() functions
//so incase there is an error inside the callback function we have to write the try catch block
//but writing that everytime will become a little messy

//hence we pass the entire async function as an argument in the asyncHandler function
//and here we analyze if there is an error or not in the async function

const asyncHandler = (requestHandler) => ( //requestHandler is function (req, res) => {}
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err)=> next(err))
    }
)