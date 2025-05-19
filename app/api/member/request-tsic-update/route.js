import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';

/**
 * API endpoint for requesting TSIC code update
 * POST /api/member/request-tsic-update
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { userId, memberCode, tsicCodes } = body;
    
    console.log('Extracted values:', { userId, memberCode, tsicCodes });
    
    // Validate request data
    if (!userId || !memberCode || !tsicCodes || !Array.isArray(tsicCodes) || tsicCodes.length === 0) {
      const errorMessage = {
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่งมา',
        details: {
          userId: !!userId,
          memberCode: !!memberCode,
          hasTsicCodes: !!tsicCodes,
          isArray: Array.isArray(tsicCodes),
          tsicCodesLength: tsicCodes?.length || 0
        }
      };
      console.error('Validation failed:', errorMessage);
      return NextResponse.json(errorMessage, { status: 400 });
    }
    
    // Use a valid user ID from the database
    const users = await query('SELECT id FROM users LIMIT 1');
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ใช้ในระบบ' },
        { status: 500 }
      );
    }
    
    const validUserId = users[0].id;
    console.log(`Using valid user ID: ${validUserId} instead of provided ID: ${userId}`);
    
    // Check if there's already a pending request for this member
    const [existingRequests] = await query(
      `SELECT id, request_date FROM pending_tsic_updates 
       WHERE member_code = ? AND status = ? LIMIT 1`,
      [memberCode, 'pending']
    );
    
    if (existingRequests && existingRequests.length > 0) {
      const pendingRequest = existingRequests[0];
      const requestDate = new Date(pendingRequest.request_date).toLocaleDateString('th-TH');
      
      return NextResponse.json({ 
        success: false, 
        code: 'PENDING_REQUEST_EXISTS',
        message: 'มีคำขอที่รอการอนุมัติอยู่แล้ว',
        details: {
          requestId: pendingRequest.id,
          requestDate: requestDate
        },
        help: 'กรุณารอการอนุมัติหรือติดต่อเจ้าหน้าที่เพื่อยกเลิกคำขอเดิมก่อน' 
      }, { status: 400 });
    }
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Extract all TSIC codes
      const tsicCodesList = tsicCodes.map(item => item.tsic_code).filter(Boolean);
      
      if (tsicCodesList.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'ไม่พบรหัส TSIC ที่ต้องการบันทึก'
        }, { status: 400 });
      }
      
      // Store the complete TSIC data as JSON
      const tsicData = JSON.stringify(tsicCodes);
      let firstRequestId = null;
      
      // Process each TSIC code
      for (const tsicItem of tsicCodes) {
        const tsicCode = tsicItem.tsic_code;
        
        // ดึงข้อมูลที่ถูกต้องจากฐานข้อมูล
        let categoryOrder;
        let categoryName;
        
        try {
          // ขั้นตอนที่ 1: ดึง category_order จากตาราง tsic_categories โดยใช้ tsic_code
          const [categoryOrderResult] = await query(
            `SELECT category_order FROM tsic_categories WHERE tsic_code = ? LIMIT 1`,
            [tsicCode]
          );
          
          if (categoryOrderResult && categoryOrderResult.length > 0) {
            categoryOrder = categoryOrderResult[0].category_order;
            
            // ขั้นตอนที่ 2: ดึงชื่อหมวดหมู่จากตาราง tsic_description โดยใช้ category_code
            // ต้องใช้ category_order เป็นตัวค้นหาในตาราง tsic_description เท่านั้น
            const [categoryNameResult] = await query(
              `SELECT category_name FROM tsic_description WHERE category_code = ? LIMIT 1`,
              [categoryOrder]
            );
            
            if (categoryNameResult && categoryNameResult.length > 0) {
              categoryName = categoryNameResult[0].category_name;
              console.log(`Found correct category for TSIC ${tsicCode}: ${categoryOrder} - ${categoryName}`);
            } else {
              // ถ้าไม่พบชื่อหมวดหมู่ในฐานข้อมูล ให้ใช้ค่าเริ่มต้น
              categoryName = `หมวดหมู่ ${categoryOrder}`;
              console.warn(`Category name not found for code ${categoryOrder}, using default name: ${categoryName}`);
            }
          } else {
            // ถ้าไม่พบ tsic_code ในฐานข้อมูล ใช้ค่าจากฟอร์ม
            categoryOrder = tsicItem.category_order || tsicItem.category_code;
            
            // พยายามดึงชื่อหมวดหมู่จากฐานข้อมูลอีกครั้ง
            const [categoryNameResult] = await query(
              `SELECT category_name FROM tsic_description WHERE category_code = ? LIMIT 1`,
              [categoryOrder]
            );
            
            if (categoryNameResult && categoryNameResult.length > 0) {
              categoryName = categoryNameResult[0].category_name;
            } else {
              // ถ้ายังไม่พบอีก ใช้ค่าเริ่มต้น
              categoryName = `หมวดหมู่ ${categoryOrder}`;
              console.warn(`Category name not found for code ${categoryOrder}, using default name: ${categoryName}`);
            }
          }
        } catch (error) {
          console.warn(`Error getting category information for TSIC ${tsicCode}:`, error);
          categoryOrder = tsicItem.category_order || tsicItem.category_code;
          categoryName = tsicItem.category_name || `หมวดหมู่ ${categoryOrder}`;
        }
        
        const tsicDescription = tsicItem.tsic_description || tsicItem.description;
        
        console.log(`Inserting TSIC ${tsicCode} with true category ${categoryOrder} (${categoryName})`);
        
        // เก็บเฉพาะข้อมูลของรายการนี้เท่านั้น
        const singleTsicData = JSON.stringify([tsicItem]);
        
        // Insert the record with individual fields and JSON data
        const result = await query(
          `INSERT INTO pending_tsic_updates 
           (user_id, member_code, category_code, category_name, tsic_code, tsic_description, tsic_data, request_date, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [validUserId, memberCode, categoryOrder, categoryName, tsicCode, tsicDescription, singleTsicData, new Date(), 'pending']
        );
        
        // Save the ID of the first inserted record
        if (firstRequestId === null) {
          firstRequestId = result.insertId;
        }
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'คำขอของท่านได้ถูกส่งไปยังเจ้าหน้าที่แล้ว กรุณารอการอนุมัติ',
        requestId: firstRequestId
      });
      
    } catch (error) {
      // Rollback in case of error
      await query('ROLLBACK');
      console.error('Error in TSIC update request transaction:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Error in TSIC update request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}
