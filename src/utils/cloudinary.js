const cloudinary = require('cloudinary').v2

const fs = require('fs') //file system(no need to install this package, already present)
//helps in reading, writing, removing etc

// Configuration - copy from the website
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)  return null

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //automatically detects which file is being uploaded
        }) 

        //file has been uploaded successfully
        console.log("File has been uploaded on cloudinary", response.url)
        //response.url will give the cloudinary url that is generated after uploading

        return response


    } catch (error) {
        //if we enter this block then it means localFilePath exists (ie. file exists on our server)
        //but it hasnt been uploaded properly 

        //it removes the locally saved temp file as the upload operation got failed 
        //and this is done in a synchronous way ie. this process is completed first then proceeded further
        fs.unlinkSync(localFilePath)
    }
}

export {cloudinary}