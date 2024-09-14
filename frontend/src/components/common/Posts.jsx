import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ( {feedType, username, userId} ) => {

  const getPostEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all"; 
      case "following": 
        return "/api/posts/following"; 
      case "posts":
        return `/api/posts/user/${username}` 
      case "likes": 
        return `/api/posts/likes/${userId}`
      default:
        return "/api/posts/all"
    }
  }

  const POST_ENDPOINT = getPostEndPoint(); 

  //to fetch points
  const {data:posts, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ["posts"], 
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong fetching posts");
        }
        return data; 
      } catch (error) {
        throw new Error(error)
      }
    }
  })

  useEffect(() => {
refetch()
  }, [feedType, refetch, username])


  return (
    <>
      {/* is loading show this: daisyui skeletons */}
      {(isLoading || isRefetching) && (
        <div className='flex flex-col justify-center'>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab.</p>}
      {/* if not loading: added posts here and mapping through posts from queryFn: no need for static posts data */}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
