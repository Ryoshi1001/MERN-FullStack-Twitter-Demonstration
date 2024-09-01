import mongoose from "mongoose";

//connection to MongoDb with async function and try catch block
const mongodbConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDb connected to: ${connect.connection.host}`)
  } catch (error) {
    console.error(`Error connecting to Mongodb: ${error.message}`)
    process.exit(1)
  }
}

//exporting mongodbConnection to be used in server.js
export default mongodbConnection; 