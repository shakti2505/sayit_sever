import dotenv from "dotenv";
dotenv.config();
import UserModal from "../../modals/userModal.js";
import jwt from 'jsonwebtoken';

export const genrateRefreshTokenAndAccessToken = async (_id, email) => {
    try {
      // generate access token
      const accessToken = jwt.sign(
        { _id, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_TIMEOUT,
        }
      );
      // genrating refresh token
      const refreshToken = jwt.sign(
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