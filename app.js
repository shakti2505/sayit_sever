import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import connectDB from "./DB/connectDB.js";
import "./modals/userModal.js";
import { Server } from "socket.io";
import { setUpSocket } from "./middleware/socket.js";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redisClient from "./utils/redis.config.js";

// connecting to DB
const DB_URL = process.env.DB_URL;

connectDB(DB_URL);

const app = express();

// middle ware
const allowedOrigins = [
  "http://localhost:5173",
  "https://just-sayit.netlify.app",
];
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // console.log("Incoming request from origin:", origin); // Log the origin

      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        console.error(msg, "Origin:", origin); // Log the error
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const server = http.createServer(app);

//setting up socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://just-sayit.netlify.app"],
    credentials: true,
  },
  adapter: createAdapter(redisClient),
});
setUpSocket(io);
export { io };

const PORT = process.env.PORT || 8080;

// passing io to the routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRouter);
app.use("/api", groupRouter);
app.use("/api", contactRouter);


server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
