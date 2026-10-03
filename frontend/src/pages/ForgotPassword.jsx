import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/auth/forgot-password", {
        email: email.trim()
      });

      setMessage(
        res.data.msg ||
          "If an account exists for that email, a reset link has been sent."
      );
    } catch (e) {
      setMessage(
        e?.response?.data?.msg ||
          "Unable to process your request right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">
          Forgot Password?
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          Enter your email and we'll send you a password reset link.
        </p>

        <input
          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-4 outline-none focus:border-gray-500"
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-300">
            {message}
          </div>
        )}

        <p className="mt-5 text-sm text-gray-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}