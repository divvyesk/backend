const mongoose = require("mongoose")
const {Video} = require("../models/video.model.js")
const {Subscription} = require("../models/subscription.model.js")
const {Like} = require("../models/like.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.params.channelId; //identify the channel

        const totalVideos = await Video.countDocuments({ channelId });
        const totalSubscribers = await Subscription.countDocuments({ channelId });
        const totalLikes = await Like.countDocuments({ channelId });
        
        const totalViews = await Video.aggregate([
            { $match: { channelId } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);

        res.status(200).json({
            totalVideos,
            totalSubscribers,
            totalLikes,
            totalViews: totalViews[0] ? totalViews[0].totalViews : 0
        });
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.params.channelId; //identify the channel
    
    const videos = await Video.find({ channelId }).sort({ createdAt: -1 }); 
    //find all videos uploaded by the channel and sort them by createdAt in descending order so that the most recent videos are returned first
    
    res.status(200).json(new ApiResponse(videos, "Videos retrieved successfully"));

})

export {
    getChannelStats, 
    getChannelVideos
    }