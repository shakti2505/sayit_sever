// auth controler
import axios from "axios";
import { oauth2Client } from "../utils/googleConfig.js";
import UserModal from "../modals/userModal.js";
import Jwt from "jsonwebtoken";
import {
  hashPassword,
  verifyPassword,
} from "../utils/encryption/HashPassword/hashPassword.js";
import { genrateRefreshTokenAndAccessToken } from "../utils/tokenGeneration/generateToken.js";

const maxAge = 3 * 60 * 60;

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
      const newUser = new UserModal({
        name: name,
        email: email,
        image: picture,
      });
      user = await newUser.save({ validateBeforeSave: false });
    }
    const { _id } = user;
    // creating jwt token to pass it to the client
    const { refreshToken, accessToken } =
      await genrateRefreshTokenAndAccessToken(_id, email);
    await UserModal.findById(_id).select(
      "-passwordHash -refreshToken -saltHash"
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      // maxAge: maxAge * 5000,
      maxAge: 10000, // 10 seconds
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

export const savePublicKey = async (req, res) => {
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

        const loggedInUser = await UserModal.findById(_id).select(
          "-passwordHash -saltHash -refreshToken"
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
        return res.status(200).json({
          message: "logged in successfully",
          accessToken,
          loggedInUser,
          user_id: _id,
        });
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
// refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.body.refreshToken || req.cookies.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "unauthorized request" });
    }
    // verify the refresh token
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // fetchig user
    const user = await UserModal.findById(decodedToken?._id);

    // checking if user exist or not?
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // matching the complete incoming token and token saved in the database

    if (incomingRefreshToken !== user.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is expired or used" });
    }

    // once all verification are done then generating new tokens
    const { refreshToken, accessToken } =
      await genrateRefreshTokenAndAccessToken(user._id, user.email);
    // setting tokens in the database
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

    return res.status(200).json({
      accessToken,
      refreshToken: refreshToken,
      message: "Access token refreshed",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: error.messsage || "Invalid Refresh Token" });
  }
};

// logout
export const logoutUser = async (req, res) => {
  try {
    // removing the refresh token of logged in user from the database
    await UserModal.findByIdAndUpdate(
      req.user._id,

      {
        $set: { refreshToken: "" },
      },
      { new: true }
    );

    const option = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json({ message: "loggoed Out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
};

export const createPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Please provide password" });

    //hash password
    const { hash, salt } = await hashPassword(password);

    // fetch user
    await UserModal.findByIdAndUpdate(req.user._id, {
      $set: { passwordHash: hash, saltHash: salt },
    });
    return res.status(201).json({ message: "Password created successfully" });
  } catch (error) {
    console.log(error);
    F;
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPasswordForQRcodeGeneration = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: "No password found" });

    // fetch user
    const user = await UserModal.findById(req.user._id);
    if (user) {
      const { passwordHash, saltHash } = user;

      // verify password
      const passwordMatch = await verifyPassword(
        password,
        passwordHash,
        saltHash
      );
      if (passwordMatch)
        return res
          .status(200)
          .json({ message: "Password verified Successfully" });
      else return res.status(401).json({ message: "Invalid Password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
