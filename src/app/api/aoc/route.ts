import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim() || '';
    const portal = searchParams.get('portal')?.trim() || '';
    const year = searchParams.get('year')?.trim() || '';
    const org = searchParams.get('org')?.trim() || '';

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (portal) {
      whereClause += ' AND portal_type = ?';
      params.push(portal);
    }

    if (year) {
      whereClause += ' AND year = ?';
      params.push(parseInt(year));
    }

    if (org) {
      whereClause += ' AND org_name = ?';
      params.push(org);
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR tender_id LIKE ? OR ref_no LIKE ? OR org_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const offset = (page - 1) * limit;

    // Build query for counting total rows
    const countSql = `SELECT COUNT(*) as count FROM aoc_tenders ${whereClause}`;
    
    // Build query for fetching items
    const fetchSql = `
      SELECT 
        internal_id, 
        portal_type, 
        year, 
        sl_no, 
        aoc_date, 
        closing_date, 
        title, 
        ref_no, 
        tender_id, 
        org_name, 
        detail_url, 
        partition_id
      FROM aoc_tenders 
      ${whereClause} 
      ORDER BY rowid DESC
      LIMIT ? OFFSET ?
    `;

    // Execute queries in parallel
    const [countResult, itemsResult] = await Promise.all([
      runQuery(countSql, params),
      runQuery(fetchSql, [...params, limit, offset])
    ]);

    const totalItems = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // Get available years for filtering
    const yearsResult = await runQuery(`
      SELECT DISTINCT year 
      FROM aoc_tenders 
      WHERE year IS NOT NULL 
      ORDER BY year DESC
    `);
    const years = yearsResult.map((r: any) => Number(r.year));

    const serializedData = itemsResult.map((item: any) => ({
      ...item,
      year: item.year !== null ? Number(item.year) : null,
      partition_id: item.partition_id !== null ? Number(item.partition_id) : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedData,
      years,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      }
    });
  } catch (error: any) {
    console.error('AOC API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
