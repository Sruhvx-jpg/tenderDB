import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const baseRows = await runQuery(
      `SELECT * FROM aoc_tenders WHERE internal_id = ? LIMIT 1`,
      [id]
    );

    if (baseRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'AOC record not found' },
        { status: 404 }
      );
    }

    const aoc = baseRows[0];
    
    // Attempt to load details separately
    try {
      const detailsRows = await runQuery(
        `SELECT details_json, scraped_at FROM aoc_details WHERE internal_id = ? LIMIT 1`,
        [id]
      );
      if (detailsRows && detailsRows.length > 0) {
        aoc.details_json = detailsRows[0].details_json;
        aoc.details_scraped_at = detailsRows[0].scraped_at;
      }
    } catch (detailsErr) {
      console.warn('Failed to load AOC details from details table:', detailsErr);
    }
    
    // Attempt to parse details_json if present
    let parsedDetails = null;
    if (aoc.details_json) {
      try {
        parsedDetails = JSON.parse(aoc.details_json);
      } catch (e) {
        console.warn('Failed to parse details_json for AOC:', id, e);
        parsedDetails = aoc.details_json;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...aoc,
        details_json: parsedDetails,
        year: aoc.year ? Number(aoc.year) : null,
        partition_id: aoc.partition_id ? Number(aoc.partition_id) : null
      }
    });
  } catch (error: any) {
    console.error('AOC Details API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
