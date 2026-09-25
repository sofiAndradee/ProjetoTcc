import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from  "react-router-dom";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
   const navigate = useNavigate();

useEffect(() => {
    const salvo = localStorage.getItem("user");
    if (salvo && salvo !== "undefined") {
        try {
            setUser(JSON.parse(salvo));
        } catch {
            localStorage.removeItem("user");
        }
    }
}, []);
  function login(dadosUsuario) {
    setUser(dadosUsuario);
    localStorage.setItem("user", JSON.stringify(dadosUsuario));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}