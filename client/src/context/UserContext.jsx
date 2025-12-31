import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'

// eslint-disable-next-line react-refresh/only-export-components
export const userDataContext = createContext();

const UserContext = ({ children }) => {

    // Use environment variable for server URL, fallback to production URL
    const serverUrl = "https://virtual-assistant-teal.vercel.app"
    const [userData, setUserData]= useState(null)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const handleCurrentUser = async()=>{
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials:true})
        setUserData(result.data)
        console.log(result.data)
      } catch (error) {
        // 401 means user is not logged in - this is expected, not an error
        if(error.response?.status === 401 || error.response?.status === 400){
          setUserData(null)
          return
        }
        // Only log actual errors (network issues, server errors, etc.)
        console.error("Error fetching current user:", error)
      }
    }

    const getGeminiResponse = async(command)=>{
      try {
        const result = await axios.post(`${serverUrl}/api/user/askToAssistant`,{command},{withCredentials:true})
        return result.data
      } catch (error) {
        console.log(error)
        return {type: "general", userInput: command, response: "Sorry, I encountered an error. Please try again."}
      }
    }

    useEffect(()=>{
      // Avoid calling setState synchronously in useEffect body
      // Instead, define async function inside effect
      const fetchCurrentUser = async () => {
        await handleCurrentUser();
      }
      fetchCurrentUser();
    },[])

    const value={serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage, getGeminiResponse}


  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
