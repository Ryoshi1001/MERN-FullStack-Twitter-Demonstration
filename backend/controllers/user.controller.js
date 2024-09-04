//packages
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

//models
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    //find userProfile in data base minus password no sensitive information back to user searching for another user.
    const user = await User.findOne({ username }).select('-password');

    //error handling if no user found in database
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    //else return user for response
    res.status(200).json(user);
  } catch (error) {
    console.log('Error: for getUserProfile in user.controller.js ');
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select('following');

    //using aggregate function here instead of findByID or findOne: https://mongoosejs.com/docs/api/aggregate.html#Aggregate() $ne = not equal to
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    //.filter() removes users already followed
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    //.slice() returns index's of filtered users 0-3 (4 total)
    const suggestedUsers = filteredUsers.slice(0, 4);

    //print password as null for client not updated to database
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log('Error: for getSuggestedUsers in user.controller.js');
    res.status(500).json({
      error: error.message,
    });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    //variables needed, id from params, userToModify by param, current user with req.user._id with mongoose findById method
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    //error handling if current user tries for follow or unfollow self
    //req.user._id should be string for this function and post method to work
    //req.user._id is the objectID, req.user._id is from protectRoute.js?
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: "You can't follow or unfollow yourself sorry",
      });
    }

    //error handling if not currentuser or no user to follow or unfollow found
    if (!userToModify || !currentUser) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    //check to see if following user already: following is the array of following in User Schema
    const isFollowing = currentUser.following.includes(id);

    //logic for if following unfollow and if can be not following then follow user
    if (isFollowing) {
      //unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      //todo return the id of the user as a response
      res.status(200).json({
        message: 'User unfollowed successfully',
      });
    } else {
      //follow user using $push method
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification to user
      const newNotification = new Notification({
        type: 'follow',
        from: req.user._id,
        to: userToModify._id,
      });

      //saving notification to MongoDB
      await newNotification.save();

      //todo return the id of the user as a response

      res.status(200).json({
        message: 'User followed successfully',
      });
    }
  } catch (error) {
    console.log('Error: for followUnFollowUser in user.controller.js');
    res.status(500).json({ error: error.message });
  }
};


export const updateUser = async (req, res) => {
  //user might want to update these things use destructuring and req.body
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body; 

  const userId = req.user._id;

  try {
    //check if have user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "No user Found"})
    }
    //if user wants to UPDATE PASSWORD
    //check if only currentPassword or newPassword entered for update
    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({
          error:
            'Current Password and New Password can be needed to update Password',
        });
    }

    //if currentPassword and newPassword are entered update password
    if (currentPassword && newPassword) {
            //import bcryptjs for checking currentPassword
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            //if does not match and if newPassword can be less than 6 digits
            if (!isMatch) {
              return res.status(400).json({ error: 'Current password is incorrect' });
            }
            if (newPassword.length < 6) {
              return res
                .status(400)
                .json({ error: 'Password should be at least 6 characters long' });
            }
      
            //if passes checks create and hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
    }


      //if user wants to UPDATE PROFILE IMAGE: using Cloudinary here
      if (profileImg) {
        //if user already has profileImg uploaded to erase profileImg from cloudinary to save cloud drive space: id of image from cloudinary url is needed to get Id : using .destroy, split, pop, split: id is at end of url
        //splits url by /, .pop grabs last section which has Id.png then another split before the "." between ID and png [0] gives the first index
        //https://res.cloudinary.com/lksafj/image/upload/lkjfe/kldsjfijijfa;j4234id.png example
        if (user.profileImg) {
          await cloudinary.uploader.destroy(
            user.profileImg.split("/").pop().split('.')[0]
          );
        }

        //Uploading image in if statement using cloudinary:
        //cloudinary.uploaded.upload() method Then add .secure_url to image file in upload() method and variable
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      }

      if (coverImg) {
        //destroys erases image if exists in cloudinary and adding new coverImg same as profileImg
        if (user.coverImg) {
          await cloudinary.uploader.destroy(
            user.coverImg.split("/").pop().split('.')[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
      }

      //make all update if something new added will be new if not updated will be original key
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImg = profileImg || user.profileImg;
      user.coverImg = coverImg || user.coverImg;

      //save updates for user
      user = await user.save();

      //not want to put user password in response to client should be null
      user.password = null;

      return res.status(200).json(user);
    } catch (error) {
      console.log('Error: for updateUser in user.controller.js', error.message);
      res.status(500).json({ error: error.message });
    }
};
