import { Request, Response } from 'express';
 
import cloudinary from '../config/cloudinary';

export class ManagerController {
 constructor(private managerService: any){}
 
   async registerManager(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;

      // Check for uploaded certificate
      if (!req.file) {
        res.status(400).json({ message: 'Certificate upload is required.' });
        return;
      }

      // Upload the certificate to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'manager_certificates', // Folder in Cloudinary for organization
        public_id: `manager_${email}`, // Unique public ID for the file
        resource_type: 'auto', // Automatically detect file type
        overwrite: true, // Overwrite the file if it already exists
      });

      // secure URL from Cloudinary
      const certificatePath = result.secure_url;

      // Call the service to handle registration
      const manager = await this.managerService.registerManager({
       
        name,
        email,
        password,
        phone,
        certificate: certificatePath,
      });
console.log('managerdata',manager)
      res.status(201).json({
        message: 'Manager registered successfully. Pending admin approval.',
        manager,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Manager login handler
  public async loginManager(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Authenticate manager

      const  { manager, accessToken, refreshToken } = await this.managerService.loginManager(email, password);
      console.log('Managerservice returned:', { manager, accessToken, refreshToken });
       // Set cookies for tokens
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,    
      maxAge: 3000,  
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    secure: false,   
      maxAge: 7 * 24 * 60 * 60 * 1000,   
    });
    res.status(200).json({
      message: 'Login successful',
      manager,  
    })
    } catch (error: any) {
      console.log('login error',error.message)
      res.status(400).json({ error: error.message });
    }
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const managerId = req.params.id; 
      const profile = await this.managerService.getManagerProfile(managerId);
  
      if (!profile) {
        res.status(404).json({ message: 'Manager profile not found.' });
        return;
      }
  
      res.status(200).json(profile);
    } catch (error: any) {
      console.error('Error fetching manager profile:', error);
      res.status(500).json({ message: 'Error fetching manager profile' });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      // Log the cookies received in the request
      console.log('Cookies received:', req.cookies);
  
      const refreshToken = req.cookies.refreshToken;
 
      if (!refreshToken) {
        console.log('Refresh token is missing');
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }
  
      // Log the refresh token
      console.log('Refresh token:', refreshToken);
  
      // Call the service to refresh the access token using the provided refresh token
      const tokens = await this.managerService.refreshAccessToken(refreshToken);
   
      console.log('Tokens returned from service:', tokens);
  
      if (!tokens || !tokens.accessToken) {
        console.log('No valid access token returned');
        res.status(400).json({ message: 'Invalid refresh token or no tokens returned' });
        return;
      }
  
      // If the access token is valid, set it as a cookie
      if (tokens.accessToken) {
        console.log('Access token is valid. Setting cookie.');
  
        res.cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000, 
        });
      }
  
      // Log the response sent to the client
      console.log('Sending response with new access token');
  
      res.status(200).json({
        tokens: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error: any) {
      console.error('Failed to refresh tokens:', error.message);
      res.status(500).json({ message: 'Failed to refresh tokens', error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      console.log('forgetemail', email);
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }
      const response = await  this.managerService.forgotPasswordVerify(email);
      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error: any) {
      console.error('Error in forgotPassword controller:', error.message);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
    
 
      console.log('Received request body:', req.body);
    
      if (!email || !password) {
        console.log('Missing email or newPassword in request body');
        res.status(400).json({ success: false, message: 'Email and new password are required' });
        return;
      }
    
      console.log(`Attempting to reset password for email: ${email}`);
      
      const response = await this.managerService.resetPassword(email, password);
     
      console.log('Response from userService.resetPassword:', response);
    
      if (response.success) {
        console.log(`Password successfully updated for email: ${email}`);
        res.status(200).json({ success: true, message: 'Password successfully updated' });
      } else {
        console.log(`Failed to update password for email: ${email}. Reason:`, response);
        res.status(400).json(response);
      }
    } catch (error: any) {
       
      console.error('Error in resetPassword controller:', error.message, error.stack);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } 
  
}
