//ES6 module type import: dotenv and mongodb connection for cleaner code
import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import mongodbConnection from "./db/connectMongoDB.js";
import "dotenv/config"

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

app.listen(PORT, () => {
  console.log(`backend express server running on port: ${PORT} at http://localhost:5000`)
  mongodbConnection(); 
})

