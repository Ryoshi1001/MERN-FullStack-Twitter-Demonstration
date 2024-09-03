import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; 
import generateTokenAndSetCookie from "../lib/utils/generateToken.js"

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body; 

    //email validation: email regex with if statement to test if email is valid and returning error if invalid. 
    const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email entered"
      })
    }

    //check for existing user in db
    const existingUser = await User.findOne({ username: username }); 
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" })
    }

    //checking for existing email entered with db
    const existingEmail = await User.findOne({ email }); 
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use"})
    }

    //password always need to be hashed: for security in case db is hacked
    if (password.length < 6) {
      return res.status(400).json({ error: "Password entered should be 6 characters long"})
    }

    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt); 
    

    const newUser = new User({
      fullName, 
      username, 
      email, 
      password: hashedPassword
    })

    //if new user generate new token, in response password is not sent to client and also can be followers to coverImg will get default values made in the model and send response to client
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res)
      await newUser.save()

      res.status(201).json({
        _id: newUser._id, 
        fullName: newUser.fullName, 
        username: newUser.username, 
        email: newUser.email, 
        followers: newUser.followers, 
        following: newUser.following,
        profileImg: newUser.profileImage, 
        coverImg: newUser.coverImg,  
      })
    } else {
      res.status(400).json({ error: "Invalid user data"})
    }
  } catch (error) {
    console.log("Error: controller for signup in auth.controller.js", error.message); 
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const login = async (req, res) => {
  try {
    //need to get username and password for user logging in: using destructuring to make variables for username and password
    const { username, password } = req.body; 

    //find user
    const user = await User.findOne({ username })

    //check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user?.password || "")

    //if not user or wrong password send error to client
    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: "Invalid Username or Password, Try Again."})
    }

    //if there is user and password is correct generate Token and set Cookie
    generateTokenAndSetCookie(user._id, res); 

    res.status(200).json({
      _id: user._id, 
      fullName: user.fullName, 
      username: user.username, 
      password: user.password, 
      email: user.email, 
      followers: user.followers, 
      following: user.following, 
      profileImg: user.profileImg, 
      coverImg: user.coverImg, 
    })

  } catch (error) {
    console.log("Error: controller for login in auth.controller.js", error.message); 
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 0})
    res.status(200).json({ 
      message: "Logged out successfully"
    })

  } catch (error) {
    console.log("Error: controller for logout in auth.controller.js", error.message); 
    res.status(500).json({ error: "Internal Server Error" })
  }
}


//gets authenticated user if authenticated or not As a Programmer
export const authCheck = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.status(200).json(user)
  } catch (error) {
    console.log("Error: controller for authCheck in auth.controller.js", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
}


