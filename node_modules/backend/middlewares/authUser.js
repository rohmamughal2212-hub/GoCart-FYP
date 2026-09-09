import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = (header && header.startsWith("Bearer ") ? header.slice(7) : null) || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

export default authUser;
