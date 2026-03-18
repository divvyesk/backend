import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// create tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user?._id

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    res.status(201).json(
        new ApiResponse(tweet, "Tweet created successfully")
    )
})


// get tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })

    res.status(200).json(
        new ApiResponse(tweets, "User tweets fetched successfully")
    )
})


// update tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet")
    }

    tweet.content = content || tweet.content
    await tweet.save()

    res.status(200).json(
        new ApiResponse(tweet, "Tweet updated successfully")
    )
})


// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized to delete this tweet")
    }

    await tweet.deleteOne()

    res.status(200).json(
        new ApiResponse({}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}