 const asyncHandler = require('../utils/asyncHandler')
 const ApiError = require('../utils/ApiError.js')

 const userModel = require("../models/user.models.js")
 const User = userModel.User //used to directly communicate with the db

 const {uploadOnCloudinary} = require('../utils/cloudinary.js')
 const {ApiResponse} = require('../utils/ApiResponse.js')

 const jwt = require('jsonwebtoken')
 const mongoose = require('mongoose')
 
 const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // add this refresh token into the db (since in model file, it is one of the attributes of user)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        //when user entirely added to the db, this function is called which will encrypt the function using bcrypt

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


 const registerUser = asyncHandler(async (req, res) => {
    //s1: get user detail from frontend
    const {fullName, email, username, password} = req.body //req is sent by the frontend and consists of all the data
    console.log("email: ", email)


    //s2: validation of email
    if(
        [fullName, email, username, password].some(() => 
        field?.trim() === "")//checks all the elements in the array
        //and runs a callback function for it
        //callback function checks if a particular field is empty
    )
    {
        throw new ApiError(400, "All fields are required")
    }

    //s3: check if user already exists or not using email and username
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
        //so this is the OR operator
        //findOne is a function that will return the value 
        //so it will return username or email whichever is found
    })

    if(existedUser)
    {
        throw new ApiError(409, "User with email or username already exists" )
    }


    //s4: check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }


    //s5: upload them to cloudinary, avatar
    //simply import the cloudinary method and use it directly to upload files
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    //s6: create user object -> create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    //check if the user was succesfully created
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //these fields are not returned   
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

    } )

    //s7: remove password and refreshtoken field from response

    //s8: check for user creation

    //s9: if yes then return response
    const loginUser = asyncHandler(async (req, res) =>{
        // req body -> data
        // username or email
        //find the user
        //password check
        //access and referesh token
        //send cookie
    
        const {email, username, password} = req.body
        console.log(email);
    
        if (!username && !email) {
            throw new ApiError(400, "username or email is required")
        }
        
        // Here is an alternative of above code based on logic discussed in video:
        // if (!(username || email)) {
        //     throw new ApiError(400, "username or email is required")
            
        // }
    
        const user = await User.findOne({
            $or: [{username}, {email}]
        })
    
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }
        
       //we had created this method in user.model.js 
       const isPasswordValid = await user.isPasswordCorrect(password)
    
       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
    
        
       const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)



        //send cookies 
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
        //configuring cookies
        const options = {
            httpOnly: true, //this means cookies can be modified using the server only
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options) 
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
    
    })
    
    const logoutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true 
            }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
    })
    
    const refreshAccessToken = asyncHandler(async (req, res) => { 
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request")
        }
    
        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
        
            const user = await User.findById(decodedToken?._id)
        
            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }
        
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used")
                
            }
        
            const options = {
                httpOnly: true,
                secure: true
            }
        
            const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
        
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token")
        }
    
    })
    
    const changeCurrentPassword = asyncHandler(async(req, res) => {
        const {oldPassword, newPassword} = req.body
    
        
    
        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid old password")
        }
    
        user.password = newPassword
        await user.save({validateBeforeSave: false})
    
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
    })
    
    
    const getCurrentUser = asyncHandler(async(req, res) => {
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
    })
    
    const updateAccountDetails = asyncHandler(async(req, res) => {
        const {fullName, email} = req.body
    
        if (!fullName || !email) {
            throw new ApiError(400, "All fields are required")
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: { //mongodb operator
                    fullName: fullName,
                    email: email
                }
            },
            {new: true}
            
        ).select("-password")
    
        return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
    });
    
    const updateUserAvatar = asyncHandler(async(req, res) => {
        const avatarLocalPath = req.file?.path //using multer middleware
    
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is missing")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
    
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading on avatar")
            
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
    })
    
    const updateUserCoverImage = asyncHandler(async(req, res) => {
        const coverImageLocalPath = req.file?.path
    
        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover image file is missing")
        }
    
        //TODO: delete old image - assignment
    
    
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
        if (!coverImage.url) {
            throw new ApiError(400, "Error while uploading on avatar")
            
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
    })
    
    
    const getUserChannelProfile = asyncHandler(async(req, res) => {
        const {username} = req.params
    
        if (!username?.trim()) {
            throw new ApiError(400, "username is missing")
        }
    
        const channel = await User.aggregate([
            //so this pipeline will first match the username in the user collection
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            //and then it will lookup in the subscription collection to find the subscribers 
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                //and subscribedTo details 
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                //and then it will add those details as new fields in the user document
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            { 
                //and then it will project only the required fields to be sent in response
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
    
                }
            }
        ])
        //so this will return an array of channels matching the username, ideally it should be only one channel since username is unique

        if (!channel?.length) {
            throw new ApiError(404, "channel does not exists")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
    })
    
    const getWatchHistory = asyncHandler(async(req, res) => {
        const user = await User.aggregate([
            {
                //this stage will match the user id in the user collection and 
                $match: {
                    //here the id that you requested is a string, using the mongoose function we convert it into object id and then match it with the
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                //then it will lookup for the videos in the video collection using the watchHistory array of user document 
                $lookup: {
                    from: "videos", //model file
                    localField: "watchHistory", //field that we want to be the filter
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            //nested lookup to find the owner details of the video from user collection using the owner field of video document
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        //and then it will project only the required fields to be sent in response
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            //and then it will add those video details in the watchHistory field of user document and then it will project only the required fields to be sent in response
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ])
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
    })
    
    
    export {
        registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
    }