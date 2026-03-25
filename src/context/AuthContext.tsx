import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Admin {
  name: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  login: (data: { token: string; admin: Admin }) => void;
  logout: () => void;
  loading: boolean; // ✅ new
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true); // ✅ new

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false); // ✅ mark as done
  }, []);

  const login = (data: { token: string; admin: Admin }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);