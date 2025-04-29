import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const limit = 10; // Number of messages per page
    const offset = (page - 1) * limit;

    console.log('Query parameters:', { page, status, search, limit, offset });
    
    // Simple approach: Get all messages first
    try {
      let allMessagesQuery = 'SELECT * FROM guest_contact_messages';
      
      // Add simple WHERE clause if needed
      if (status !== 'all') {
        allMessagesQuery += ` WHERE status = '${status}'`;
      }
      
      // Add ORDER BY and LIMIT
      allMessagesQuery += ' ORDER BY id DESC';
      
      console.log('Executing query:', allMessagesQuery);
      
      // Get all messages
      const allMessages = await query(allMessagesQuery);
      console.log(`Retrieved ${allMessages.length} total messages`);
      
      // Filter by search term in JavaScript if needed
      let filteredMessages = allMessages;
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filteredMessages = allMessages.filter(msg => 
          (msg.name && msg.name.toLowerCase().includes(searchLower)) ||
          (msg.email && msg.email.toLowerCase().includes(searchLower)) ||
          (msg.subject && msg.subject.toLowerCase().includes(searchLower))
        );
      }
      
      // Calculate pagination
      const totalCount = filteredMessages.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Apply pagination in JavaScript
      const paginatedMessages = filteredMessages.slice(offset, offset + limit);
      
      return NextResponse.json({
        success: true,
        messages: paginatedMessages,
        totalCount,
        totalPages,
        currentPage: page
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      
      // Check if table doesn't exist
      if (queryError.message.includes('ER_NO_SUCH_TABLE') || 
          queryError.message.includes('doesn\'t exist')) {
        return NextResponse.json({
          success: true,
          messages: [],
          totalCount: 0,
          totalPages: 1,
          currentPage: 1,
          tableExists: false
        });
      }
      
      return NextResponse.json(
        { success: false, message: `Database query error: ${queryError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching guest messages:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch guest messages: ${error.message}` },
      { status: 500 }
    );
  }
}
