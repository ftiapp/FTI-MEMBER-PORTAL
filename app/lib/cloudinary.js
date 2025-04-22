'use server';

import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

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
    let processedBuffer = fileBuffer;
    
    // Set appropriate MIME type for common document types
    if (fileExt === 'pdf') mimeType = 'application/pdf';
    else if (['doc', 'docx'].includes(fileExt)) mimeType = 'application/msword';
    else if (['xls', 'xlsx'].includes(fileExt)) mimeType = 'application/vnd.ms-excel';
    else if (fileExt === 'txt') mimeType = 'text/plain';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      // Process images to reduce size and resolution
      try {
        console.log(`Processing image: ${fileName} (${fileBuffer.length} bytes)`);
        
        // Determine if it's an image type
        if (fileExt === 'jpg' || fileExt === 'jpeg') mimeType = 'image/jpeg';
        else if (fileExt === 'png') mimeType = 'image/png';
        else if (fileExt === 'gif') mimeType = 'image/gif';
        else if (fileExt === 'webp') mimeType = 'image/webp';
        
        // Compress and resize the image
        processedBuffer = await sharp(fileBuffer)
          .resize({ 
            width: 1280, // Limit width to 1280px
            height: 1280, // Limit height to 1280px
            fit: 'inside', // Maintain aspect ratio
            withoutEnlargement: true // Don't enlarge smaller images
          })
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toBuffer();
          
        console.log(`Image processed: ${fileName} (${processedBuffer.length} bytes, ${Math.round((1 - processedBuffer.length / fileBuffer.length) * 100)}% reduction)`);
        mimeType = 'image/jpeg'; // Set to JPEG since we converted it
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // If image processing fails, continue with original buffer
      }
    }
    
    // Convert buffer to base64
    const base64Data = Buffer.from(processedBuffer).toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      // Special handling for PDFs to ensure they're viewable
      const options = {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${fileName.split('.')[0].replace(/\s+/g, '_')}`,
        overwrite: true,
        timeout: 120000 // Increase timeout to 2 minutes (120000ms)
      };
      
      // For PDFs, set specific options to ensure they're viewable
      if (fileExt === 'pdf') {
        options.resource_type = 'auto';
        options.format = 'pdf';
        // ไม่ต้องใช้ flags attachment เพราะจะทำให้ไม่สามารถเปิดดูได้โดยตรง
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        // For images, set optimization options
        options.format = 'jpg'; // Force JPEG format for all images
        options.quality = 'auto'; // Let Cloudinary optimize quality
        options.fetch_format = 'auto'; // Let Cloudinary choose best format
        options.flags = 'lossy'; // Allow lossy compression
        options.transformation = [
          { width: 1280, height: 1280, crop: 'limit' } // Limit dimensions
        ];
      } else {
        options.format = fileExt; // Explicitly set the format based on file extension
      }
      
      cloudinary.uploader.upload(
        dataURI,
        options,
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
