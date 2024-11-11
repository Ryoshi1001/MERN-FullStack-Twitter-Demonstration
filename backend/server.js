//ES6 module type import
//import packages
import express from "express"
import cookieParser from "cookie-parser"
import "dotenv/config"
import path from "path"
import { v2 as cloudinary } from "cloudinary"

//import routes
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"

//import utility functions
import mongodbConnection from "./db/connectMongoDB.js";
import axios from "axios"

//configure cloudinary : is v2 from cloudinary but renamed as: cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
})


//create express server
const app = express(); 
const PORT = process.env.PORT || 5000; 

//adding when deploying website
const __dirname = path.resolve()

//create Middleware needed
//middleware for parsing payload req.body req.params
app.use(express.json({limit: "5mb"})); //to parse req.body limit should not be too high DOS denial of service can happen
//middleware for parsing url encoded items; also used in postman for testing requests for routes: to parse form data(urlencoded) 
app.use(express.urlencoded({ extended: true }))
//middleware for authentication authorization protectRoute.js file: parse cookies
app.use(cookieParser())

//middleware for routes
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/posts", postRoutes); 
app.use("/api/notifications", notificationRoutes); 

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist"))); 

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`backend express server running on port: ${PORT} at http://localhost:5000`)
  mongodbConnection(); 
})

//Render Keep-alive reloader function helps with instance spin-down: 
const url = "https://mern-fullstack-twitter-demonstration.onrender.com"; 
const interval = 30000; 
const reloadWebsite = () => {
  axios.get(url)
  .then(response => {
    console.log(`Reloaded website at ${new Date().toUTCString()} : Status Code ${response.status}`); 
  })
  .catch(error => {
    console.log(`Error reloading website at ${new Date().toUTCString()}:`, error.message); 
  });
}; 

setInterval(reloadWebsite, interval)

