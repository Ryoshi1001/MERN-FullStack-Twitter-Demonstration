import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id; 

    //get notifications from db sent to this user
    //use populate method to show "from" and with notification senders username and profileImg if added
    const notifications = await Notification.find({ to:userId })
    .populate({
      path: "from", 
      select: "username profileImg"
    })

    //update notification using updateMany to update many objects in notification model
    await Notification.updateMany({to:userId}, {read: true}); 

    res.status(200).json(notifications)

  } catch (error) {
    console.log("Error: for getNotifications in notification.controller.js", error.message)
    return res.status(500).json({ error: "Internal Server Error"})
  }
}

export const deleteNotifications = async (req, res) => {
  try {
    //get user id
    const userId = req.user._id; 

    //delete all notifications sent to us as user
    await Notification.deleteMany({ to: userId }); 

    res.status(200).json({ message: "Notifications Deleted Successfully"})
  } catch (error) {
    console.log("Error: for deleteNotifications in notification.controller.js", error.message)
    return res.status(500).json({error: "Internal Server Error"})
  }
}


//extra function made for deleting one notification by id
// export const deleteNotification = async (req, res) => {
//   try {
//     const notificationId = req.params.id; 
//     const userId = req.user._id; 

//     const notification = await Notification.findById(notificationId)

//     if (!notification) {
//       return res.status(404).json({ error: "Notification Not Found"})
//     }

//     if (notification.to.toString() !== userId.toString()) {
//       return res.status(404).json({ error: "You are not allowed to erase this notification"})
//     }

//     await Notification.findByIdAndDelete(notificationId); 
//     res.status(200).json({ message: "Notification erased successfully"})

//     res.status(200).json({ message: "Notification Erased Successfully"})
//   } catch (error) {
//     console.log("Error: for deleteNotification in notification.controller.js")
//     return res.status(500).json({ error: "Internal Server Error"})
//   }
// }