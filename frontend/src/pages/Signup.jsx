import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api, setToken } from "../api";

export default function Signup({ setTok }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const signup = async () => {
    try {
      const res = await api.post("/auth/signup", { name, email, pass });

      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setTok(res.data.token);
    } catch (e) {
      alert(e?.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Signup</h2>
        <p className="text-sm text-gray-400 mb-6">Create your account 🚀</p>

        <input
          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-3 outline-none focus:border-gray-500"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-3 outline-none focus:border-gray-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-4 outline-none focus:border-gray-500"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          onClick={signup}
          className="w-full p-3 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
        >
          Create Account
        </button>

        <p className="mt-4 text-gray-400 text-sm">
          Already have account?{" "}
          <Link className="text-blue-400 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
