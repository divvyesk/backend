//whatever error we send does not have a standard structure 
//hence this file comes in which defines how each error will be structured
class apiError extends Error{
    //Error is a class which contains certain functions

    constructor(statusCode, message= "Something went wrong", errors = [], statck = ""){
        super(message)

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(statck)
            {
                this.stack = statck
            }else
            {
                Error.captureStackTrace(this, this.constructor)
            }
    }
    
}

export {apiError}