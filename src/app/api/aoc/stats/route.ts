import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = serializeBigInt(obj[key]);
      }
    }
    return res;
  }
  return obj;
}

export async function GET() {
  try {
    const topWinnersQuery = `
      SELECT 
        selected_bidders as winner, 
        count(*) as awards_count,
        SUM(number_of_bids_received) as total_bids
      FROM aoc_details_json 
      WHERE selected_bidders IS NOT NULL AND selected_bidders != ''
      GROUP BY winner 
      ORDER BY awards_count DESC 
      LIMIT 10
    `;

    const topWinnersBidsQuery = `
      SELECT 
        selected_bidders as winner, 
        SUM(number_of_bids_received) as total_bids,
        count(*) as awards_count
      FROM aoc_details_json 
      WHERE selected_bidders IS NOT NULL AND selected_bidders != ''
      GROUP BY winner 
      ORDER BY total_bids DESC 
      LIMIT 10
    `;

    const topIssuersQuery = `
      SELECT 
        organisation_name as issuer, 
        count(*) as count 
      FROM aoc_details_json 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY issuer 
      ORDER BY count DESC 
      LIMIT 10
    `;

    const [winnersRows, winnersBidsRows, issuersRows] = await Promise.all([
      runQuery(topWinnersQuery),
      runQuery(topWinnersBidsQuery),
      runQuery(topIssuersQuery)
    ]);

    return NextResponse.json(serializeBigInt({
      success: true,
      winnersByAwards: winnersRows,
      winnersByBids: winnersBidsRows,
      issuers: issuersRows
    }));
  } catch (err: any) {
    console.error('AOC Stats API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
