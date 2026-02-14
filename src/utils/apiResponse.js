//just like apiError file, we define a standard structure for api response here
class ApiResponse{
    constructor(statusCode, data, message = "Success")
    {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}