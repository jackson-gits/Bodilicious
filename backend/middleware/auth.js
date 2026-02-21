import admin from "../config/firebaseAdmin.js";
import UserProfile from "../profile/models.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token.",
      });
    }

    const token = header.split(" ")[1];

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // Find user in DB
    let user = await UserProfile.findOne({
      firebaseUID: decoded.uid,
    });

    // Auto-create profile if first login
    if (!user) {
      user = await UserProfile.create({
        firebaseUID: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
