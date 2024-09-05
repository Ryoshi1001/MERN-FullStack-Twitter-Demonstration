// https://www.youtube.com/watch?v=4GUVz2psWUg
//: 1:39 video
//ES6 module type import
//import packages
import express from "express"
import cookieParser from "cookie-parser"
import "dotenv/config"
import { v2 as cloudinary } from "cloudinary"

//import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"


//import utility functions
import mongodbConnection from "./db/connectMongoDB.js";

//configure cloudinary : is v2 from cloudinary but renamed as: cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
})


//create express server
const app = express(); 
const PORT = process.env.PORT || 5000; 

//create Middleware needed
//middleware for parsing payload req.body req.params
app.use(express.json())
//middleware for parsing url encoded items; also used in postman for testing requests for routes: to parse form data(urlencoded) 
app.use(express.urlencoded({ extended: true }))
//middleware for authentication authorization protectRoute.js file: parse cookies
app.use(cookieParser())

//middleware for routes
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/posts", postRoutes)

app.listen(PORT, () => {
  console.log(`backend express server running on port: ${PORT} at http://localhost:5000`)
  mongodbConnection(); 
})

