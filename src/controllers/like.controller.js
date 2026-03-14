const mongoose = require("mongoose").isValidObjectId
const {Like} = require("../models/like.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
        }

    const like = await Like.findOne({ videoId, userId: req.user.id }); 
    //check if the user has already liked the video by searching for a like document with the videoId and userId in the database

        if (like) {
        await Like.deleteOne({ _id: like._id }); //if a like document is found, delete it from the database to remove the like
        return res.status(200).json(new ApiResponse(200, "Like removed"));
        } else {
        await Like.create({ videoId, userId: req.user.id }); //if no like document is found, create a new like document in the database to add the like
        return res.status(201).json(new ApiResponse(201, "Like added"));
        }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params //instead of video id we are taking comment id, everything else is same
    //TODO: toggle like on comment

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const like = await Like.findOne({ commentId, userId: req.user.id });
        
        if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, "Like removed"));
        } else {
        await Like.create({ commentId, userId: req.user.id });
        return res.status(201).json(new ApiResponse(201, "Like added"));
        }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params //here tweet id taken instead of video id or comment id
    //TODO: toggle like on tweet
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const like = await Like.findOne({ tweetId, userId: req.user.id });
        
        if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, "Like removed"));
        } else {
        await Like.create({ tweetId, userId: req.user.id });
        return res.status(201).json(new ApiResponse(201, "Like added"));
        }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({ userId: req.user.id, videoId: { $exists: true } }).populate('videoId');
    
    return res.status(200).json(new ApiResponse(200, "Liked videos retrieved", likedVideos));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}