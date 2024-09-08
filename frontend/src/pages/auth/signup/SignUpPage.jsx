import {
  MdDriveFileRenameOutline,
  MdOutlineMail,
  MdPassword,
} from 'react-icons/md';

import { FaUser } from 'react-icons/fa';
import XSvg from '../../../components/svgs/X';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import toast from "react-hot-toast"
import { useMutation, useQueryClient } from '@tanstack/react-query';


const SignUpPage = () => {
  const [formData, setFormData] = useState({ 
    email: "", 
    fullName: "",
    username: "", 
    password: "", 
  }); 

const queryClient =  useQueryClient()

  //function to signup user using Mutation: useMutation has function "mutate", and can be in different states like pending, success or error
const { mutate, isError, isPending, error } = useMutation({
  mutationFn: async ({email, username, fullName, password}) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify( {email, username, fullName, password} )
      }); 

      // if(!res.ok) throw new Error("Something went wrong")
      //data returned from fetch
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || "Failed to create account")
      console.log(data)
      return data; 
    } catch (error) {
      console.log(error)
      throw error; 
    }
  },
  onSuccess: () => {
    toast.success("Account created successfully")
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
  },
  
}); 

//adding the mutate function destructured from useMutation
//formData: is in useState and values are from input elements in form. 
  const handleSubmit = (e) => {
    e.preventDefault(); 
    mutate(formData); 
  }

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  
  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form onSubmit={handleSubmit} className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col">
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                name="fullName"
                placeholder="Full Name"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>
          <label className='input input-bordered flex items-center gap-2 rounded'>
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button  className='btn rounded-full btn-primary text-white'>
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && <p className='text-red-400'>{error.message}</p>}
        </form>
        <div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
          <p className='text-wrap text-lg'>Already have an account?</p>
          <Link to="/login">
            <button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;