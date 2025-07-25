import { NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/app/lib/cloudinary';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicIdParam = searchParams.get('publicId');
    
    if (!publicIdParam) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Use the publicId as-is - Cloudinary handles folder paths
    const result = await deleteFromCloudinary(publicIdParam);
    
    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Image deleted successfully',
          result: result.result 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete image',
          result: result.result 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
