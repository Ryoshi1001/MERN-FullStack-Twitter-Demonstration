//User Model: NOSQL Collection mongoose schemas for MongoDb Collections
//user will be for the signup section/function

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true, 
    unique: true, 
  }, 
  fullName: {
    type: String, 
    required: true, 
  }, 
  password: {
    type: String, 
    required: true, 
    minlength: 6, 
  }, 
  email: {
    type: String, 
    required: true, 
    unique: true, 
  }, 
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId, // follower will need to have mongodb objectId; mongodb has objectId this is how it will add those users as followers
      ref: "User", 
      default: []
    }
  ], 
  following: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: []
    } 
  ], 
  profileImage: {
    type: String, 
    default: "", 
  }, 
  coverImg: {
    type: String, 
    default: ""
  }, 
  bio: {
    type: String, 
    default: ""
  }, 
  link: {
    type: String, 
    default: ""
  }
}, {timestamps: true}) 

const User = mongoose.model("User", userSchema)
//in data base collection/table it be users in mongodb

export default User; 