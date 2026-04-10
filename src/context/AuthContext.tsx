import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Admin {
  name: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  login: (data: { accessToken: string; refreshToken: string; admin: Admin }) => void;
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

  const login = (data: { accessToken: string; refreshToken: string; admin: Admin }) => {
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
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