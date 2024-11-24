import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"
import { v2 as cloudinary } from "cloudinary";



export const getAllPosts = async (req, res) => {
	try {

		//.find() empty returns all posts/items from db for model
		//.populate({path, select}) populates keys that have extra data like "user" which can have email, password, profileImg and many other things needed. 
		const allPosts = await Post.find().sort({ createdAt: -1}).populate({
			path: "user", 
			select: "-password"
		})
		.populate({
			path: "comments.user", 
			select: "-password"
		})

		//if no posts in db return empty [] array 
		if (allPosts.length === 0) {
			return res.status(200).json([])
		}


		res.status(200).json(allPosts)
		
	} catch (error) {
		console.log("Error: for getAllPosts in post.controller.js", error.message)
		return res.status(500).json({ error: "Internal Server Error" })
	}
}


export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img, {
				folder: "twitterapp"
			});
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text: text, 
			img: img
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		return res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error.message);
	}
};

export const deletePost = async (req, res) => {
	try {
		//get post by id
		const post = await Post.findById(req.params.id)

		//if no post error handling
		if (!post) {
			return res.status(400).json({ error: "Post not found" })
		}

		//post was id needs to string
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post"})
		}

		//if post has image delete it from Cloudinary folder
		if (post.img) {
			const urlParts = post.img.split('/');
			const filename = urlParts.pop(); // Get the filename with extension
			const folderPath = urlParts.pop(); // Get the folder name
			const publicId = `${folderPath}/${filename.split('.')[0]}`; // Construct public ID

			await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
	}
		//delete post document from mongodb also 
		await Post.findByIdAndDelete(req.params.id); 

		//send response message to client for post deletion
		res.status(200).json({ message: "Post deleted successfully"})
		
	} catch (error) {
		console.log("Error: for deletePost in post.controller.js", error.message)
		return res.status(500).json({ error: "Internal Server Error" })
	}
}

export const postComment = async (req, res) => {
	try {
		const { text } = req.body; 
		const postId = req.params.id; 
		const userId = req.user._id; 

		//error handling if no text is added when posting comment
		if (!text) {
			return res.status(400).json({ error: "Text field is required cannot be empty"})
		}

		//fetching post from database
		const post = await Post.findById(postId)

		//error handling if no post found by its id
		if (!post) {
			return res.status(404).json({ error: "Post was not found"})
		}

		//create comment with new values
		const comment = {user: userId, text}

		//add comment to comments array in db
		post.comments.push(comment); 

		//save post with new comment added
		await post.save(); 

		//send post to client 
		res.status(200).json(post)
		
	} catch (error) {
		console.log("Error: for postComment in post.controller.js", error.message)
		return res.status(500).json({ error: "Internal Server Error" })
	}
}

export const likeUnlikePost = async (req, res) => {
	try {
		//post id
		const { id:postId } = req.params; 
		//find post by id
		const post = await Post.findById(postId); 
		//user id
		const userId = req.user._id; 

		if (!post) {
			return res.status(400).json({ error: "Post not found" })
		}

		//check if user already liked the post
		const userAlreadyLikedPost = post.likes.includes(userId); 

		//if liked then unlike post else like post
		if (userAlreadyLikedPost) {
			//unlike a post
			await Post.updateOne({ _id: postId }, { $pull: {likes: userId} })
			//removing liked post from user
			await User.updateOne({ _id: userId }, { $pull: {likedPosts: postId} })
			
			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString()); 
			res.status(200).json(updatedLikes)
		} else {
			//like post
			post.likes.push(userId)
			//adding liked post to user
			await User.updateOne({ _id: userId}, { $push: {likedPosts: postId} })
			await post.save()

			//send notification of like
			const notification = new Notification({
				from: userId, 
				to: post.user, 
				type: "like"
			})

			//save notification
			await notification.save(); 

			const updatedLikes = post.likes
			res.status(200).json(updatedLikes)
		}

	} catch (error) {
		console.log("Error: for likeUnlikePost in post.controller.js")
		return res.status(500).json({ error: "Internal Server Error"})
	}
}


export const getLikedPosts = async (req, res) => {
	//get user id before try catch
	const userId = req.params.id; 

	try {
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({error: "User not found"})
		}

		//getting all liked posts by user from likedPosts array in user model 
		//then populate "user" field and erase password and populate "user" in "comments" array from Post model
		const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
		.populate({path: "user", select: "-password"})
		.populate({path: "comments.user", select: "-password"})

		res.status(200).json(likedPosts)

	} catch (error) {
		console.log("Error: for getLikedPosts in post.controller.js", error.message)
		return res.status(500).json("Internal Server Error")
	}
}

export const getFollowingPosts = async (req, res) => {
	try {
		//variables made for user
		const userId = req.user._id; 
		const user = await User.findById(userId); 

		//handle error for no user
		if (!user) {
			return res.status(404).json({ error: "User not found"})
		}

		//get following from user following array in user model 
		const following = user.following; 

		//find following posts by user id using .find and $in projection operator, sorting, then populate to populate user data and user data in comments minus passwords of user
		const followingPosts = await Post.find({ user: { $in: following } })
		.sort ({ createdAt: -1 })
		.populate({ path: "user", select: "-password"})
		.populate({ path: "comments.user", select: "-password"})

		res.status(200).json(followingPosts)
	} catch (error) {
		console.log("Error: for getFollowingPosts in post.controller.js", error.message)
		return res.status(500).json({error: "Internal Server Error"})
	}
}

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params; 
		
		const user = await User.findOne({ username })

		if (!user) {
			return res.status(404).json({ error: "User not found"})
		}

		const posts = await Post.find({user: user._id}).sort({ createdAt: -1 })
		.populate({
			path: "user", 
			select: "-password"
		})
		.populate({
			path: "comments.user", 
			select: "-password"
		})

		res.status(200).json(posts)

	} catch (error) {
		console.log("Error: for getUserPosts in post.controller.js", error.message)
		return res.status(500).json({ error: "Internal Server Error"})
	}
}



