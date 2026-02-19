import { registerUser } from '../controllers/user.controllers.js'

const express = require('express')

const router = express.Router()

router.route("/register").post(registerUser)

router.route("/login").post(registerUser)

export default router

