import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_CHANGE_THIS";

export default function auth(req, res, next) {
  try {
    let token = "";

    // 1) Authorization: Bearer <token>
    const h = req.headers.authorization;
    if (h && h.startsWith("Bearer ")) {
      token = h.split(" ")[1];
    }

    // 2) token from query param (useful for browser + CSV download)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (e) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

export { JWT_SECRET };
