import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const query = `
      SELECT a.*, ad.details_json, ad.scraped_at as details_scraped_at
      FROM aoc_tenders a
      LEFT JOIN aoc_details ad ON a.internal_id = ad.internal_id
      WHERE a.internal_id = ?
      LIMIT 1
    `;

    const rows = await runQuery(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'AOC record not found' },
        { status: 404 }
      );
    }

    const aoc = rows[0];
    
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
