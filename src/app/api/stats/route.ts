import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function GET() {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM tenders) as total_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'active') as active_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'archived') as archived_tenders,
        (SELECT COUNT(*) FROM aoc_tenders) as total_aoc
    `;
    
    const rows = await runQuery(statsQuery);
    const stats = rows[0];

    // Convert BigInt counts from DuckDB to numbers
    const data = {
      totalTenders: Number(stats.total_tenders),
      activeTenders: Number(stats.active_tenders),
      archivedTenders: Number(stats.archived_tenders),
      totalAoc: Number(stats.total_aoc),
    };

    // Get counts by portal type for tenders
    const portalTenders = await runQuery(`
      SELECT portal_type, COUNT(*) as count 
      FROM tenders 
      GROUP BY portal_type
    `);

    // Get counts by portal type for AOC
    const portalAoc = await runQuery(`
      SELECT portal_type, COUNT(*) as count 
      FROM aoc_tenders 
      GROUP BY portal_type
    `);

    // Get top organisations by tender count
    const topOrgs = await runQuery(`
      SELECT organisation_name, COUNT(*) as count 
      FROM tenders 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY organisation_name 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Get top organisations by AOC count
    const topAocOrgs = await runQuery(`
      SELECT org_name as organisation_name, COUNT(*) as count 
      FROM aoc_tenders 
      WHERE org_name IS NOT NULL AND org_name != ''
      GROUP BY org_name 
      ORDER BY count DESC 
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      summary: data,
      tendersByPortal: portalTenders.map((r: any) => ({
        portal: r.portal_type,
        count: Number(r.count),
      })),
      aocByPortal: portalAoc.map((r: any) => ({
        portal: r.portal_type,
        count: Number(r.count),
      })),
      topOrgs: topOrgs.map((r: any) => ({
        name: r.organisation_name,
        count: Number(r.count),
      })),
      topAocOrgs: topAocOrgs.map((r: any) => ({
        name: r.organisation_name,
        count: Number(r.count),
      })),
    });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
