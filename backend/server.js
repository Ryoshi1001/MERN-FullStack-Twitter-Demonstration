import express from "express"
import authRoutes from "./routes/auth.routes.js"
//ES6 module type import for dotenv and mongodb connection for cleaner code
import "dotenv/config"
import mongodbConnection from "./db/connectMongoDB.js";


//create express server
const app = express(); 
const PORT = process.env.PORT || 5000; 

//create middleware
app.use("/api/auth", authRoutes); 

//routes

app.listen(PORT, () => {
  console.log(`backend express server running on port: ${PORT}`)
  mongodbConnection(); 
})

