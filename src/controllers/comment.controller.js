const mongoose = require('mongoose');
const {Comment} = require('../models/comment.models.js')
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit) // skip the first (page - 1) * limit comments why? because we want to get the next page of comments
        .limit(limit) // limit the number of comments returned to the limit specified in the query params
        .sort({ createdAt: -1 }); // sort the comments by createdAt in descending order so that the most recent comments are returned first

    res.status(200).json(new ApiResponse(comments, "Comments retrieved successfully"));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId, content } = req.body; //req contains details about the comment to be added

        if (!content) {
            throw new ApiError(400, "Comment content is required");
        }

        const newComment = new Comment({ 
            //create a new comment instance and fill it up with the details from the request body
            videoId,
            content,
            createdAt: new Date(),
        });

        await newComment.save(); //save the new comment to the database

        res.status(201).json(new ApiResponse(newComment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params; //get the commentId of the comment to be updated from the request parameters
    const { content } = req.body; //get the updated content of the comment

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content, updatedAt: new Date() },
        { new: true, runValidators: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(new ApiResponse(updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params; //get the commentId of the comment to be deleted from the request parameters

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            throw new ApiError(404, "Comment not found");
        }

        res.status(200).json(new ApiResponse(deletedComment, "Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }