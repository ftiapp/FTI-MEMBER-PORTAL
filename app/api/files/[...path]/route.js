import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
  try {
    const filePath = params.path.join('/');
    
    // Security: Ensure the path is within uploads directory
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'public', safePath);
    
    // Ensure the file exists and is within public directory
    const resolvedPath = path.resolve(fullPath);
    const publicDir = path.resolve(process.cwd(), 'public');
    
    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Read file
    const fileBuffer = await readFile(resolvedPath);
    
    // Get file extension to determine content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
