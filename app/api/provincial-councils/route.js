import { NextResponse } from 'next/server';

// Mock database function to simulate database operations
const mockDbQuery = async (query, ...params) => {
  console.log('Mock DB Query:', query, params);
  // Return mock data for provincial councils
  return { 
    rows: [
      { id: 1, name_th: 'กรุงเทพมหานคร', name_en: 'Bangkok' },
      { id: 2, name_th: 'เชียงใหม่', name_en: 'Chiang Mai' },
      { id: 3, name_th: 'ชลบุรี', name_en: 'Chonburi' },
      { id: 4, name_th: 'นครราชสีมา', name_en: 'Nakhon Ratchasima' },
      { id: 5, name_th: 'ภูเก็ต', name_en: 'Phuket' }
    ] 
  };
};

export async function GET() {
  try {
    const result = await mockDbQuery(
      'SELECT id, name_th, name_en FROM provincial_councils ORDER BY name_th ASC'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching provincial councils:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสภาอุตสาหกรรมจังหวัด' },
      { status: 500 }
    );
  }
}
