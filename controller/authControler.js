// auth controler
import axios from "axios";
import { oauth2Client } from "../utils/googleConfig.js";
import UserModal from "../modals/userModal.js";
import Jwt from "jsonwebtoken";
import {
  hashPassword,
  verifyPassword,
} from "../utils/encryption/HashPassword/hashPassword.js";

const maxAge = 3 * 60 * 60;

const genrateAccessToken = (_id, email) => {
  const accessToken = Jwt.sign(
    { _id, email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_TIMEOUT,
    }
  );
  return accessToken;
};

const genrateRefreshTokenAndAccessToken = async (_id, email) => {
  try {
    // generate access token
    const accessToken = Jwt.sign(
      { _id, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_TIMEOUT,
      }
    );
    // genrating refresh token
    const refreshToken = Jwt.sign(
      { _id, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_TIMEOUT,
      }
    );
    // fetcing user
    const user = await UserModal.findById(_id);
    //saving generated refresh token
    user.refreshToken = refreshToken;
    // saving user object and with validation false to avoid passing required values
    await user.save({ validateBeforeSave: false });
    // returing refresh tokens
    return { refreshToken, accessToken };
  } catch (error) {
    console.log(error);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    const result = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(result.tokens);
    const userResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${result.tokens.access_token}`
    );
    const { email, name, picture } = userResponse.data;
    let user = await UserModal.findOne({ email: email });
    if (!user) {
      await UserModal.create({
        name: name,
        email: email,
        image: picture,
      });
    }
    const { _id } = user;
    // creating jwt token to pass it to the client
    const { refreshToken, accessToken } =
      await genrateRefreshTokenAndAccessToken(_id, email);
    await UserModal.findById(id).select(
      "-passwordHash -refreshToken -saltHash"
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: maxAge * 5000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .cookie()
      .json({ message: "success", accessToken, user, user_id: _id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const savePubicKey = async (req, res) => {
  try {
    const { public_key } = req.body;
    const user = req.user;
    const loggedInUser = await UserModal.findById(user._id);
    if (loggedInUser.public_key.length === 0) {
      await UserModal.findByIdAndUpdate(user._id, {
        public_key: public_key,
      });
      return res.status(201).json({ message: "key saved successfully" });
    } else {
      return res.status(200).json({ message: "key already added" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};

// login with user name and password
export const signUpWithPassword = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // checking if user name and password exists
    if (!username || !password || !email)
      return res
        .status(401)
        .json({ message: "No username or password found!" });

    //returning 409 status code if email already exists in the databse.
    const isEmailExists = await UserModal.find({ email: email });
    if (isEmailExists.length > 0)
      return res.status(409).json({ message: "Email already exists" });

    // hashing password before saving it to database, destructuring hash and salt to save in the database;
    const { hash, salt } = await hashPassword(password);

    // saving username, passwordHash, saltHash to the database,
    await UserModal.create({
      name: username,
      passwordHash: hash,
      saltHash: salt,
      email: email,
    });
    return res.status(201).json({ message: "Account Created Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// login with email and password
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email)
      return res
        .status(401)
        .json({ message: "No username or password found!" });
    // extract user from using email
    const existingUser = await UserModal.findOne({ email: email });
    if (existingUser) {
      // verifying password
      const { passwordHash, saltHash, _id, email } = existingUser;
      const passwordMatch = await verifyPassword(
        password,
        passwordHash,
        saltHash
      );
      if (passwordMatch) {
        // genrating jwt access & refresh token to send to client and save in cookies
        const { refreshToken, accessToken } =
          await genrateRefreshTokenAndAccessToken(_id, email);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: maxAge * 5000,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res
          .status(200)
          .json({ message: "valid credentials, login successfully" });
      } else {
        return res
          .status(401)
          .json({ message: "Invalid password, Login failed" });
      }
    } else {
      return res.status(401).json({ message: "Email Not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
