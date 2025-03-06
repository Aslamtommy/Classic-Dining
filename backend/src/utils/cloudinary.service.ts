import cloudinary from "../config/cloudinary";

export class CloudinaryService {
  static async uploadFile(
    filePath: string,
    folder: string,
    publicId?: string
  ): Promise<string> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: "auto",
        overwrite: true,
        type: "authenticated",  
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      return result.secure_url;  
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // New method to generate a signed URL
  static generateSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
    const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresAt = timestamp + expiresInSeconds; // Expiration time

    return cloudinary.utils.private_download_url(publicId, "jpg", {  
      expires_at: expiresAt,
      type: "authenticated",  
    });
  }
}