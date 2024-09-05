import express from "express"
import protectRoute from "../middleware/protectRoute.js"
import { getUserProfile, followUnFollowUser, getSuggestedUsers, updateUser } from "../controllers/user.controller.js"


const router = express.Router(); 

//make 4 methods for users route

//get user profile
router.get("/profile/:username", protectRoute, getUserProfile)

//get suggested profiles for user
router.get("/suggested", protectRoute, getSuggestedUsers)

//post: follow un-follow user
router.post("/follow/:id", protectRoute, followUnFollowUser)

//post: update user profile
router.post("/update", protectRoute, updateUser)

export default router; 