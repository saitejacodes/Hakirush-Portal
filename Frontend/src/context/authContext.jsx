import axios from 'axios'
import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.data?.success) {
          setUser(response.data.user)
        } else {
          setUser(null)
        }

      } catch (error) {
        console.log(error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
  }

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useAuth = () => useContext(UserContext)

export default AuthProvider
