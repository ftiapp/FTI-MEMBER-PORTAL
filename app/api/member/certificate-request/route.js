import { NextResponse } from 'next/server';
import { query, beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { getUserFromSession } from '@/app/lib/userAuth';

export async function POST(request) {
  try {
    // Optional auth (keep loose to allow download even if session lookup fails)
    try { await getUserFromSession(); } catch (e) { /* noop */ }

    const { memberCode } = await request.json();
    if (!memberCode) {
      return NextResponse.json({ error: 'Missing memberCode' }, { status: 400 });
    }

    // Ensure table exists (idempotent safeguard in case migration not yet applied)
    await query(`
      CREATE TABLE IF NOT EXISTS MEMBER_PORTAL_Certificate_Request (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_code VARCHAR(50) NOT NULL,
        order_no INT NOT NULL,
        request_count INT NOT NULL DEFAULT 1,
        first_requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_member_code (member_code),
        KEY idx_order_no (order_no)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Use transaction to assign a global running order_no for first-time member
    let orderNo = 1;
    let requestCount = 1;
    const existing = await query(
      'SELECT id, order_no, request_count FROM MEMBER_PORTAL_Certificate_Request WHERE member_code = ? LIMIT 1',
      [memberCode]
    );

    if (existing.length > 0) {
      // Existing member_code: keep order_no, increment request_count
      orderNo = existing[0].order_no;
      requestCount = existing[0].request_count + 1;
      await query(
        'UPDATE MEMBER_PORTAL_Certificate_Request SET request_count = ?, last_requested_at = NOW() WHERE id = ? LIMIT 1',
        [requestCount, existing[0].id]
      );
    } else {
      // First time: allocate next global order_no using transaction
      const conn = await beginTransaction();
      try {
        const rows = await executeQuery(conn, 'SELECT COALESCE(MAX(order_no), 0) AS max_order FROM MEMBER_PORTAL_Certificate_Request FOR UPDATE', []);
        orderNo = (rows?.[0]?.max_order || 0) + 1;
        requestCount = 1;
        await executeQuery(
          conn,
          'INSERT INTO MEMBER_PORTAL_Certificate_Request (member_code, order_no, request_count) VALUES (?, ?, 1)',
          [memberCode, orderNo]
        );
        await commitTransaction(conn);
      } catch (e) {
        await rollbackTransaction(conn);
        throw e;
      }
    }

    // Total requests across all member codes (after this update)
    const totals = await query(
      'SELECT COALESCE(SUM(request_count), 0) AS total_count FROM MEMBER_PORTAL_Certificate_Request',
      []
    );
    const totalCount = totals?.[0]?.total_count || 0;

    const now = new Date();
    const year = now.getFullYear();
    const thaiYear = year + 543;

    return NextResponse.json({
      success: true,
      orderNo,
      requestCount,
      totalCount,
      year,
      thaiYear,
    });
  } catch (error) {
    console.error('Error handling certificate request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
