import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.cookies.accessToken;

  if (authHeader == null || authHeader == undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accesstoken = authHeader;
  //verify the token
  jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};
export default authMiddleware;
