import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const query = `
      SELECT t.*, td.details_json, td.scraped_at as details_scraped_at
      FROM tenders t
      LEFT JOIN tender_details td ON t.internal_id = td.internal_id
      WHERE t.internal_id = ?
      LIMIT 1
    `;

    const rows = await runQuery(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    const tender = rows[0];
    
    // Attempt to parse details_json if present
    let parsedDetails = null;
    if (tender.details_json) {
      try {
        parsedDetails = JSON.parse(tender.details_json);
      } catch (e) {
        console.warn('Failed to parse details_json for tender:', id, e);
        parsedDetails = tender.details_json;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tender,
        details_json: parsedDetails,
        partition_id: tender.partition_id ? Number(tender.partition_id) : null
      }
    });
  } catch (error: any) {
    console.error('Tender Details API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
