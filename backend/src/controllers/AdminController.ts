import { Request, Response } from "express";
import { IAdminService } from "../interfaces/admin/adminServiceInterface";

class AdminController {
  

  constructor(private adminService:IAdminService) {
     
  }

  // Admin login handler
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    console.log("Incoming login request:", { email });

    try {
      // Call the service to log in the admin
      const { admin, accessToken, refreshToken } =
        await this.adminService.adminLogin(email, password);
      console.log("AdminService returned:", {
        admin,
        accessToken,
        refreshToken,
      });

      // Set cookies for tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,  
        maxAge:  3600 * 1000,  
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,  
      });

      console.log("Cookies set successfully");

      // Send successful response
      res.status(200).json({
        admin,
        success: true,
        message: "Login successful",
        email,
      });
    } catch (error: any) {
      console.error("Error during login:", error.message);
   
      res.status(401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }

  async getPendingManagers(req: Request, res: Response): Promise<void> {
    try {
      const pendingManagers = await this.adminService.getPendingManagers();
      res.status(200).json({ success: true, pendingManagers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateManagerStatus(req: Request, res: Response): Promise<void> {
    const { managerId, isBlocked } = req.body;

    try {
      const updatedManager = await this.adminService.updateManagerStatus(
        managerId,
        isBlocked
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Manager status updated",
          updatedManager,
        });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      // Log the cookies received in the request
      console.log("Cookies received:", req.cookies);

      const refreshToken = req.cookies.refreshToken;

      // Check if the refresh token is present
      if (!refreshToken) {
        console.log("Refresh token is missing");
        res.status(400).json({ message: "Refresh token is required" });
        return;
      }

      
      console.log("Refresh token:", refreshToken);

      // Call the service to refresh the access token using the provided refresh token
      const tokens = await this.adminService.refreshAccessToken(refreshToken);

  
      console.log("Tokens returned from service:", tokens);

      if (!tokens || !tokens.accessToken) {
        console.log("No valid access token returned");
        res
          .status(400)
          .json({ message: "Invalid refresh token or no tokens returned" });
        return;
      }

    
      if (tokens.accessToken) {
        console.log("Access token is valid. Setting cookie.");

        res.cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600 * 1000, 
        });
      }

      // Log the response sent to the client
      console.log("Sending response with new access token");

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
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
     
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
   
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

  async getAllManagers(req: Request, res: Response): Promise<void> {
    try {
      // Extract pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      // Call service with pagination parameters
      const { managers, total } = await this.adminService.getAllManagers(page, limit);
  
      res.status(200).json({ 
        success: true, 
        managers, 
        total,
        page,
        limit 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // List all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;


      const {users,total} = await this.adminService.getAllUsers(page,limit);
      res.status(200).json({ success: true, users ,
        total,
        page,
        limit
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async blockManager(req: Request, res: Response): Promise<void> {
    const { managerId, isBlocked } = req.body;
    console.log("managerblocks", req.body);
    try {
      const updatedManager = await this.adminService.managerBlock(
        managerId,
        isBlocked
      );
      res.status(200).json({
        message: isBlocked
          ? "Manager blocked successfully"
          : "Manager unblocked successfully",
        updatedManager,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    const { userId, isBlocked } = req.body;
    console.log("User Blocks:", req.body);

    try {
      const updatedUser = await this.adminService.blockUser(userId, isBlocked);

      res.status(200).json({
        message: isBlocked
          ? "User blocked successfully"
          : "User unblocked successfully",
        updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default AdminController;
