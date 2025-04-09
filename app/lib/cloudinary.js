'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {string} folder - Cloudinary folder to store the file in
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadToCloudinary(fileBuffer, fileName, folder = process.env.CLOUDINARY_FOLDER) {
  try {
    // Determine the correct MIME type based on file extension
    const fileExt = fileName.split('.').pop().toLowerCase();
    let mimeType = 'application/octet-stream';
    
    // Set appropriate MIME type for common document types
    if (fileExt === 'pdf') mimeType = 'application/pdf';
    else if (['doc', 'docx'].includes(fileExt)) mimeType = 'application/msword';
    else if (['xls', 'xlsx'].includes(fileExt)) mimeType = 'application/vnd.ms-excel';
    else if (fileExt === 'txt') mimeType = 'text/plain';
    
    // Convert buffer to base64
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder,
          resource_type: 'auto',
          public_id: `${Date.now()}_${fileName.split('.')[0].replace(/\s+/g, '_')}`,
          overwrite: true,
          format: fileName.split('.').pop().toLowerCase() // Explicitly set the format based on file extension
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
