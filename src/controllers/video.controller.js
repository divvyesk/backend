import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const matchStage = {}

    if (query) {
        matchStage.title = { $regex: query, $options: "i" }
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    matchStage.isPublished = true

    const sortStage = {}
    sortStage[sortBy] = sortType === "asc" ? 1 : -1

    const videos = await Video.aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        { $skip: (page - 1) * limit },
        { $limit: Number(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" }
    ])

    res.status(200).json(
        new ApiResponse(videos, "Videos fetched successfully")
    )
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const owner = req.user?._id

    if (!title) {
        throw new ApiError(400, "Title is required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner,
        isPublished: true
    })

    res.status(201).json(
        new ApiResponse(video, "Video published successfully")
    )
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res.status(200).json(
        new ApiResponse(video, "Video fetched successfully")
    )
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    let thumbnailUrl = video.thumbnail

    const thumbnailLocalPath = req.file?.path
    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)
        thumbnailUrl = thumbnailUpload.url
    }

    video.title = title || video.title
    video.description = description || video.description
    video.thumbnail = thumbnailUrl

    await video.save()

    res.status(200).json(
        new ApiResponse(video, "Video updated successfully")
    )
})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    await video.deleteOne()

    res.status(200).json(
        new ApiResponse({}, "Video deleted successfully")
    )
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    video.isPublished = !video.isPublished
    await video.save()

    res.status(200).json(
        new ApiResponse(video, "Publish status toggled")
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}