import { useState } from "react";
import XSvg from "../../../components/svgs/X"
import { MdPassword } from "react-icons/md"
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "", 
    password: ""
  })

  const queryClient = useQueryClient(); 

  const { mutate:loginMutation, isPending, isError, error} = useMutation({
    mutationFn: async ({username, password}) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST", 
          headers: {
            "Content-Type": "application/json"
          }, 
          body: JSON.stringify({username, password})
        })

        const data = await res.json()
        if(!res.ok) throw new Error(data.error || "Failed to Login")
     
      } catch (error) {
        console.log(error)
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Logged In Successfully")
      //refetching authUser
      queryClient.invalidateQueries( { queryKey: ["authUser"]} ); 
    }
  })


  const handleSubmit = (e) => {
    e.preventDefault(); 
    loginMutation(formData)
    console.log(formData)
  }

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }


  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white"/>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <label  className="input input-bordered rounded flex items-center gap-2">
          <FaUser />
            <input 
            type="text" 
            className="grow"
            placeholder="username"
            name="username"
            onChange={handleInputChange}
            value={formData.username}
            />
          </label>
          <label className="input input-bordered flex rounded items-center gap-2">
            <MdPassword />
            <input 
            type="password" 
            className="grow"
            placeholder="password"
            name="password"
            onChange={handleInputChange}
            value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Logging In..." : "Login"}
          </button>
          {isError && <p className="text-red-400">{error.message}</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-lg text-white">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">Sign up</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage