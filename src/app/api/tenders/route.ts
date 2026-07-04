import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const portal = searchParams.get('portal')?.trim() || '';
    const organisation = (searchParams.get('org') || searchParams.get('organisation'))?.trim() || '';
    
    // EMD, Category, and Type filters
    const emdMin = searchParams.get('emd_min')?.trim() || '';
    const emdMax = searchParams.get('emd_max')?.trim() || '';
    const tenderType = searchParams.get('tender_type')?.trim() || '';
    const tenderCategory = searchParams.get('tender_category')?.trim() || '';

    let joinClause = '';
    const needsJoin = !!(emdMin || emdMax || tenderType || tenderCategory);
    if (needsJoin) {
      joinClause = ' JOIN tender_details_json d ON tenders.internal_id = d.internal_id ';
    }

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND tenders.status = ?';
      params.push(status);
    }

    if (portal) {
      whereClause += ' AND tenders.portal_type = ?';
      params.push(portal);
    }

    if (organisation) {
      whereClause += ' AND tenders.organisation_name LIKE ?';
      params.push(`%${organisation}%`);
    }

    if (search) {
      whereClause += ' AND (tenders.title LIKE ? OR tenders.tender_id LIKE ? OR tenders.reference_number LIKE ? OR tenders.organisation_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (tenderType) {
      whereClause += ' AND d.tender_type = ?';
      params.push(tenderType);
    }

    if (tenderCategory) {
      whereClause += ' AND d.tender_category = ?';
      params.push(tenderCategory);
    }

    if (emdMin) {
      whereClause += " AND CAST(d.emd AS REAL) >= ?";
      params.push(parseFloat(emdMin));
    }

    if (emdMax) {
      whereClause += " AND CAST(d.emd AS REAL) <= ?";
      params.push(parseFloat(emdMax));
    }

    const offset = (page - 1) * limit;

    // Build query for counting total rows
    const countSql = `SELECT COUNT(*) as count FROM tenders ${joinClause} ${whereClause}`;
    
    // Optional details selection if joined
    const extraSelects = needsJoin ? ', d.emd, d.tender_type, d.tender_category' : '';

    // Build query for fetching items
    const fetchSql = `
      SELECT 
        tenders.internal_id, 
        tenders.tender_id, 
        tenders.detail_url, 
        tenders.status, 
        tenders.organisation_name, 
        tenders.title, 
        tenders.reference_number, 
        tenders.portal_type, 
        tenders.serial_number, 
        tenders.e_published_date, 
        tenders.bid_submission_closing_date, 
        tenders.tender_opening_date, 
        tenders.corrigendum_url, 
        tenders.scraped_at
        ${extraSelects}
      FROM tenders 
      ${joinClause}
      ${whereClause} 
      ORDER BY tenders.rowid DESC
      LIMIT ? OFFSET ?
    `;

    // Execute queries (using fast-path for count when no filters are present)
    const isUnfiltered = whereClause === 'WHERE 1=1' && !needsJoin;
    
    const [countResult, itemsResult] = await Promise.all([
      isUnfiltered ? Promise.resolve([{ count: 3952191 }]) : runQuery(countSql, params),
      runQuery(fetchSql, [...params, limit, offset])
    ]);

    const totalItems = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: itemsResult,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      }
    });
  } catch (error: any) {
    console.error('Tenders API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
