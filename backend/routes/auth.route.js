import express from "express"
import { signup, login, logout, authCheck } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js"

const router = express.Router(); 

//router routes
router.get("/me", protectRoute, authCheck)

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)


export default router; 