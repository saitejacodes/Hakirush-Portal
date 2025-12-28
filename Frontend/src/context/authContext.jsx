import axios from 'axios'
import React, { createContext, useContext, useState, useEffect } from 'react'


const userContext = createContext()

const authContext = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/auth/verify",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch(error) {
        console.log(error);
        if(error.response && !error.response.data.error) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (userData) => setUser(userData);

    const logout = () => {
        setUser(null)
        localStorage.removeItem("token")
    }
  return (
    <userContext.Provider value={{user, login, logout, loading}}>
      {children}
    </userContext.Provider>
  )
}

export const useAuth = () => useContext(userContext)
export default authContext