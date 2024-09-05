import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import { getNotifications, deleteNotifications } from "../controllers/notification.controller.js"

const router = express.Router()

//route endpoints for notifications

router.get("/", protectRoute, getNotifications)
router.delete("/", protectRoute, deleteNotifications)

//extra route for deleting one notification from db
// router.delete("/:id", protectRoute, deleteNotification)


export default router; 