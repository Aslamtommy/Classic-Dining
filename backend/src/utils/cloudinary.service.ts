import cloudinary from "../config/cloudinary";

export class CloudinaryService {
  /**
   * Uploads a file to Cloudinary.
   * @param filePath - The path of the file to upload.
   * @param folder - The folder in Cloudinary to store the file.
   * @param publicId - (Optional) A unique identifier for the file. If not provided, Cloudinary will generate one.
   * @returns The secure URL of the uploaded file.
   */
  static async uploadFile(
    filePath: string,
    folder: string,
    publicId?: string
  ): Promise<string> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: "auto", // Automatically detect the file type
        overwrite: true, // Overwrite the file if it already exists
      };

      // Add public_id if provided
      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      return result.secure_url;
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Deletes a file from Cloudinary.
   * @param publicId - The public ID of the file to delete.
   * @returns A success message if the file is deleted.
   */
  static async deleteFile(publicId: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "ok") {
        return "File deleted successfully";
      } else {
        throw new Error("Failed to delete file from Cloudinary");
      }
    } catch (error: any) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}