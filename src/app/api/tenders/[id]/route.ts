import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const baseRows = await runQuery(
      `SELECT * FROM tenders WHERE internal_id = ? LIMIT 1`,
      [id]
    );

    if (baseRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    const tender = baseRows[0];
    
    // Attempt to load details separately
    try {
      const detailsRows = await runQuery(
        `SELECT details_json, scraped_at FROM tender_details WHERE internal_id = ? LIMIT 1`,
        [id]
      );
      if (detailsRows && detailsRows.length > 0) {
        tender.details_json = detailsRows[0].details_json;
        tender.details_scraped_at = detailsRows[0].scraped_at;
      }
    } catch (detailsErr) {
      console.warn('Failed to load tender details from details table:', detailsErr);
    }
    
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
