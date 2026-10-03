import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = async () => {
    if (!token) {
      setMessage("Invalid reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/auth/reset-password", {
        token,
        pass: password
      });

      setSuccess(true);
      setMessage(
        res.data.msg || "Password reset successful."
      );
    } catch (e) {
      setSuccess(false);
      setMessage(
        e?.response?.data?.msg ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {!success ? (
          <>
            <h2 className="text-2xl font-bold mb-2">
              Reset Password
            </h2>

            <p className="text-sm text-gray-400 mb-6">
              Enter your new password below.
            </p>

            <input
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-3 outline-none focus:border-gray-500"
              placeholder="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <input
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 mb-4 outline-none focus:border-gray-500"
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {message && (
              <div className="mt-4 p-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-300">
                {message}
              </div>
            )}

            <p className="mt-5 text-sm text-gray-400">
              <Link
                to="/login"
                className="text-blue-400 hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">
              Password Reset Successful
            </h2>

            <p className="text-sm text-gray-400 mb-6">
              Your password has been changed successfully.
            </p>

            <Link
              to="/login"
              className="block w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-center font-semibold"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}