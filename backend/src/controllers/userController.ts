import { Request, Response } from "express";
 
import admin from "../config/Firebase/firebase";
import { googleUserData } from "../types/google";


import { IUserService } from "../interfaces/user/UserServiceInterface";

declare global {
  namespace Express {
    export interface Request {
      data?: {
        id: string;
        role: string;
        userId?: string; 
        
      };
    }
  }
}

export class Usercontroller {
 

  constructor(    private userService:IUserService ) {

  }

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, mobile_no } = req.body;

    

      // Calling the UserService to handle the business logic
      const newUser = await this.userService.registerUser(
        name,
        email,
        password,
        mobile_no
      );

      
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile_no: newUser.mobile_no,
        },
      });
    } catch (error: any) {
      console.log(error.message);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const { user, accessToken, refreshToken } =
        await this.userService.authenticateUser(email, password);

      // Set cookies securely
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile_no: user.mobile_no,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      console.log("GoogleSignIn: Received request with body:", req.body);

      const { idToken } = req.body;

      if (!idToken) {
        console.log("GoogleSignIn: No ID token provided.");
        res.status(400).json({ message: "ID token is required" });
        return;
      }

      console.log("GoogleSignIn: Verifying ID token.");
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Log the decoded token to verify its contents
      console.log(
        "GoogleSignIn: ID token verified. Decoded token:",
        decodedToken
      );

      const userData: googleUserData = {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        email_verified: decodedToken.email_verified!,
        name: decodedToken.name || "Unknown",
      };

      console.log("GoogleSignIn: Prepared user data:", userData);

      console.log("GoogleSignIn: Attempting to handle user sign-in/creation.");
      const { user, accessToken, refreshToken } =
        await this.userService.googleSignIn(userData);

      console.log(
        "GoogleSignIn: user, accessToken, refreshToken:",
        user,
        accessToken,
        refreshToken
      );

      // Set cookies for authentication tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Google Sign-In successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      // Log the entire error object for debugging
      console.error("GoogleSignIn: Error occurred:", error);
      res.status(500).json({
        message: "Google Sign-In failed",
        error: error.message,
      });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("Cookies received in refreshAccessToken:", req.cookies);

      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        console.warn("No refresh token found in cookies");
        res.status(400).json({ message: "Refresh token is required" });
        return;
      }

      console.log(
        "Attempting to refresh access token with refreshToken:",
        refreshToken
      );

      const tokens = await this.userService.refreshAccessToken(refreshToken);

      if (!tokens || !tokens.accessToken) {
        console.warn("Invalid refresh token or no tokens returned");
        res
          .status(400)
          .json({ message: "Invalid refresh token or no tokens returned" });
        return;
      }

      // Set the new access token in cookies
      console.log("Setting new access token in cookies");
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3000, // 15 minutes
      });

      res.status(200).json({
        tokens: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error: any) {
      console.error("Failed to refresh tokens:", error.message);
      res
        .status(500)
        .json({ message: "Failed to refresh tokens", error: error.message });
    }
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("UserController: Received getProfile request");

      const userId = req.data?.userId;
      console.log("UserController: Extracted userId:", userId);

      if (!userId) {
        res.status(400).json({ message: "User ID not found in token" });
        return;
      }

      const userProfile = await this.userService.getUserProfile(userId);

      if (!userProfile) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({ message: "Profile fetched successfully", user: userProfile });
    } catch (error: any) {
      console.error("UserController: Error in getProfile:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      console.log("forgetemail", email);
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }
      const response = await this.userService.forgotPasswordVerify(email);
      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error: any) {
      console.error("Error in forgotPassword controller:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Log the received request body
      console.log("Received request body:", req.body);

      if (!email || !password) {
        console.log("Missing email or newPassword in request body");
        res.status(400).json({
          success: false,
          message: "Email and new password are required",
        });
        return;
      }

      console.log(`Attempting to reset password for email: ${email}`);

      const response = await this.userService.resetPassword(email, password);

      // Log the response from the userService
      console.log("Response from userService.resetPassword:", response);

      if (response.success) {
        console.log(`Password successfully updated for email: ${email}`);
        res
          .status(200)
          .json({ success: true, message: "Password successfully updated" });
      } else {
        console.log(
          `Failed to update password for email: ${email}. Reason:`,
          response
        );
        res.status(400).json(response);
      }
    } catch (error: any) {
      
      console.error(
        "Error in resetPassword controller:",
        error.message,
        error.stack
      );
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      console.log("Starting uploadProfilePicture method");
  
      const userId: string | undefined = req.data?.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID not found in token" });
        return;  
      }
  
      if (!req.file || !req.file.path) {
        res.status(400).json({ message: "No file uploaded" });
        return 
      }
  
      const result = await this.userService.uploadProfilePicture(userId, req.file.path);
  
      res.status(result.success ? 200 : 404).json(result);
      return; 
    } catch (error: any) {
      console.error("Error in uploadProfilePicture method:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
      return;  
    }
  }
  
  

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        // sameSite: 'none',
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        //  sameSite: 'none',
      });

      res
        .status(200)
        .json({ success: true, message: "Signed Out Successfully" });
    } catch (error: any) {
      console.error(error.message);

      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

}
