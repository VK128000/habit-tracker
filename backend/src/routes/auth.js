import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

import User from "../models/user.js";
import { JWT_SECRET } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ------------------------------------
// Signup
// ------------------------------------

router.post("/signup", async (req, res) => {
  try {
    const { name, email, pass } = req.body;

    if (!name || !email || !pass) {
      return res.status(400).json({
        msg: "Missing fields"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const ex = await User.findOne({
      email: normalizedEmail
    });

    if (ex) {
      return res.status(400).json({
        msg: "Email already exists"
      });
    }

    const passHash = await bcrypt.hash(pass, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passHash
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    console.error("SIGNUP ERROR:", e);

    res.status(500).json({
      msg: "Server error"
    });
  }
});

// ------------------------------------
// Login
// ------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({
        msg: "Missing fields"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }

    const ok = await bcrypt.compare(pass, user.passHash);

    if (!ok) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);

    res.status(500).json({
      msg: "Server error"
    });
  }
});

// ------------------------------------
// Forgot password
// ------------------------------------

router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    // Always return the same response.
    // This prevents revealing whether an account exists.
    const successMessage =
      "If an account exists for that email, a reset link has been sent.";

    if (!email) {
      return res.json({
        msg: successMessage
      });
    }

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.json({
        msg: successMessage
      });
    }

    // Generate secure random token
    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Store only the SHA-256 hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetTokenHash = tokenHash;

    // Token expires after 15 minutes
    user.passwordResetExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      "https://habit-tracker-8z8z.vercel.app"
    ).replace(/\/$/, "");

    const resetUrl =
      frontendUrl +
      "/reset-password/" +
      rawToken;

    const from =
      process.env.EMAIL_FROM ||
      "NoFap Tracker Pro <onboarding@resend.dev>";

    // IMPORTANT:
    // Create Resend here, not at the top of this file.
    // This ensures environment variables are loaded first.
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");

      user.passwordResetTokenHash = "";
      user.passwordResetExpires = null;

      await user.save();

      return res.status(500).json({
        msg: "Email service is not configured"
      });
    }

    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    const { error } = await resend.emails.send({
      from,
      to: [user.email],
      subject: "Reset your NoFap Tracker Pro password",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            padding: 32px;
            color: #111827;
          "
        >
          <h2>NoFap Tracker Pro</h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            This password reset link expires in
            <strong>15 minutes</strong>.
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 18px;
                background: #2563eb;
                color: white;
                text-decoration: none;
                border-radius: 8px;
              "
            >
              Reset Password
            </a>
          </p>

          <p
            style="
              font-size: 13px;
              color: #6b7280;
            "
          >
            If you did not request this password reset,
            you can safely ignore this email.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("RESEND ERROR:", error);

      // Remove unusable token
      user.passwordResetTokenHash = "";
      user.passwordResetExpires = null;

      await user.save();

      return res.status(500).json({
        msg: "Unable to send reset email right now"
      });
    }

    return res.json({
      msg: successMessage
    });
  } catch (e) {
    console.error("FORGOT PASSWORD ERROR:", e);

    return res.status(500).json({
      msg: "Server error"
    });
  }
});

// ------------------------------------
// Reset password
// ------------------------------------

router.post("/reset-password", async (req, res) => {
  try {
    const { token, pass } = req.body;

    if (!token || !pass) {
      return res.status(400).json({
        msg: "Token and password are required"
      });
    }

    if (pass.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters"
      });
    }

    // Hash incoming token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find matching non-expired token
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,

      passwordResetExpires: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        msg: "Reset link is invalid or expired"
      });
    }

    // Hash new password
    user.passHash = await bcrypt.hash(pass, 10);

    // Invalidate token immediately
    user.passwordResetTokenHash = "";
    user.passwordResetExpires = null;

    await user.save();

    return res.json({
      msg: "Password reset successful"
    });
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);

    return res.status(500).json({
      msg: "Server error"
    });
  }
});

// ------------------------------------
// Reset streak
// ------------------------------------

router.post(
  "/reset-streak",
  auth,
  async (req, res) => {
    try {
      let { date } = req.body;

      if (!date) {
        date = new Date()
          .toISOString()
          .slice(0, 10);
      }

      await User.updateOne(
        {
          _id: req.user.id
        },
        {
          $set: {
            streakResetDate: date
          }
        }
      );

      res.json({
        msg: "Streak reset saved",
        date
      });
    } catch (e) {
      console.error("RESET STREAK ERROR:", e);

      res.status(500).json({
        msg: "Server error"
      });
    }
  }
);

export default router;