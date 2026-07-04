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
    const statusQuery = `
      SELECT 
        status, 
        count(*) as count 
      FROM tenders 
      GROUP BY status
    `;

    const issuersQuery = `
      SELECT 
        organisation_name as issuer, 
        count(*) as count 
      FROM tenders 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY issuer 
      ORDER BY count DESC 
      LIMIT 10
    `;

    const portalsQuery = `
      SELECT 
        portal_type, 
        count(*) as count 
      FROM tenders 
      GROUP BY portal_type
    `;

    const [statusRows, issuerRows, portalRows] = await Promise.all([
      runQuery(statusQuery),
      runQuery(issuersQuery),
      runQuery(portalsQuery)
    ]);

    return NextResponse.json(serializeBigInt({
      success: true,
      statuses: statusRows,
      issuers: issuerRows,
      portals: portalRows
    }));
  } catch (err: any) {
    console.error('Tender Stats API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
