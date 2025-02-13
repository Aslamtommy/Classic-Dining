import cloudinary from "../config/cloudinary";

export class CloudinaryService {
  /**
   * Uploads a file to Cloudinary.
   * @param filePath - The path of the file to upload.
   * @param folder - The folder in Cloudinary to store the file.
   * @param publicId - A unique identifier for the file.
   * @returns The secure URL of the uploaded file.
   */
  static async uploadFile(
    filePath: string,
    folder: string,
    publicId: string
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true,
      });
      return result.secure_url;
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
}
