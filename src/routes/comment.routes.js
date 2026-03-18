import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router(); //create a new router instance

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment); 
// Define routes for getting comments of a video and adding a new comment to a video
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
// Define routes for deleting a comment and updating a comment

export default router