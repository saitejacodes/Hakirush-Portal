import axios from "axios";
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const UserContext = createContext();

const AuthProvider = ({ children }) => {
  // ================= STATE =================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= VERIFY USER ON REFRESH =================
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        // ---------- NO TOKEN ----------
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // ---------- VERIFY TOKEN ----------
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("AUTH VERIFY ERROR:", error);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  
  const login = (userData, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }} >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);

export default AuthProvider;
