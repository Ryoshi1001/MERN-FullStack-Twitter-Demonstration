import User from "../models/user.model.js"
import jwt from "jsonwebtoken"


export const protectRoute = async (req, res, next) => {
  try {

    //getting token from the cookies
    const token = req.cookies.jwt;

    //if not token handle error
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided"})
    } 

    //if there is a token for user verify it with secret made in env file: 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    //if token is changed or invalid: expired or falsy value error msg
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token"})
    }

    //if token is valid find user by the userId in database -password
    const user = await User.findById(decoded.userId).select("-password")

    //extra check if no user even after valid token
    if (!user) {
      return res.status(404).json({ error: "User Not Found"}); 
    }

    req.user = user; 

    //calls next function: authCheck function after protectRoute middleware 
    next(); 

  } catch (error) {
    console.log("Error: in protectRoute middleware", error.message)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

export default protectRoute; 

