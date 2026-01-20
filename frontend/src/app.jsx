import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { setToken } from "./api";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setTok] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    // ensure token is stored consistently
    if (token) setToken(token);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTok("");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-bold">
              NF
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">NoFap Tracker Pro</div>
              <div className="text-xs text-gray-400">Clean days + relapse insights</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800" to="/login">
                  Login
                </Link>
                <Link className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700" to="/signup">
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={token ? <Dashboard setTok={setTok} /> : <Navigate to="/login" />} />
          <Route path="/login" element={!token ? <Login setTok={setTok} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!token ? <Signup setTok={setTok} /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
