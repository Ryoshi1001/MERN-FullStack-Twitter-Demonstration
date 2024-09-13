// functions for times of post and "member since" dates.
// using createdAt from timestamps: true


export const formatPostDate = (createdAt) => {
  const currentDate = new Date(); 
  const createdAtDate = new Date(createdAt); 

  const timeDifferenceSeconds = Math.floor((currentDate- createdAtDate) / 1000); 
  const timeDifferenceMinutes = Math.floor((timeDifferenceSeconds / 60)); 
  const timeDifferenceHours = Math.floor((timeDifferenceMinutes / 60)); 
  const timeDifferenceDays = Math.floor((timeDifferenceHours / 24)); 

  if (timeDifferenceDays > 1) {
    return createdAtDate.toLocaleDateString("en-us", {month: "short", day: "numeric"}); 
  } else if (timeDifferenceDays === 1) {
    return "1d"; 
  } else if (timeDifferenceHours >= 1) {
    return `${timeDifferenceHours}h`; 
  } else if (timeDifferenceMinutes >= 1) {
    return `${timeDifferenceMinutes}m`
  } else {
    return 'Just now'
  }
}

