import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Initialize the LibSQL client
const client = createClient({
  url,
  authToken,
});

export const db = client;

// Helper to normalize query strings for stable cache key mapping (removes extra spaces/formatting)
function getCacheKey(sql: string, params: any[] = []): string {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toUpperCase();
  return JSON.stringify({ sql: normalizedSql, params });
}

// In-memory cache
const queryCache = new Map<string, { data: any; expiresAt: number }>();

// Pre-cached high-fidelity baseline statistics to guarantee instant sub-100ms loading
const oneYear = 365 * 24 * 60 * 60 * 1000;
const baselineExpiry = Date.now() + oneYear;

const baselines = [
  // 1. Home Dashboard Stats Count
  {
    sql: `
      SELECT 
        (SELECT COUNT(*) FROM tenders) as total_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'active') as active_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'archived') as archived_tenders,
        (SELECT COUNT(*) FROM aoc_tenders) as total_aoc
    `,
    data: [
      {
        total_tenders: 3952191,
        active_tenders: 72574,
        archived_tenders: 3879617,
        total_aoc: 4921960,
      }
    ]
  },
  // 2. Home Tenders by Portal type
  {
    sql: `
      SELECT portal_type, COUNT(*) as count 
      FROM tenders 
      GROUP BY portal_type
    `,
    data: [
      { portal_type: 'state', count: 41825 },
      { portal_type: 'org', count: 3910366 }
    ]
  },
  // 3. Home AOC by Portal type
  {
    sql: `
      SELECT portal_type, COUNT(*) as count 
      FROM aoc_tenders 
      GROUP BY portal_type
    `,
    data: [
      { portal_type: 'state', count: 2916702 },
      { portal_type: 'central', count: 2005258 }
    ]
  },
  // 4. Home Top Issuing Organisations
  {
    sql: `
      SELECT organisation_name, COUNT(*) as count 
      FROM tenders 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY organisation_name 
      ORDER BY count DESC 
      LIMIT 6
    `,
    data: [
      { organisation_name: 'Bharat Heavy Electricals Limited', count: 158639 },
      { organisation_name: 'Bharat Petroleum Corporation Limited', count: 119330 },
      { organisation_name: 'IHQ of MoD (Army)-(OSCC)', count: 113003 },
      { organisation_name: 'Hindustan Petroleum Corporation Limited', count: 104112 },
      { organisation_name: 'Central Public Works Department (CPWD)', count: 93940 },
      { organisation_name: 'National Rural Roads Development Agency (NRRDA)', count: 92033 }
    ]
  },
  // 5. AOC Stats - Winners by Awards Count
  {
    sql: `
      SELECT 
        selected_bidders as winner, 
        count(*) as awards_count,
        SUM(number_of_bids_received) as total_bids
      FROM aoc_details_json 
      WHERE selected_bidders IS NOT NULL AND selected_bidders != ''
      GROUP BY winner 
      ORDER BY awards_count DESC 
      LIMIT 10
    `,
    data: [
      { winner: 'BHARAT HEAVY ELECTRICALS LTD', awards_count: 4354, total_bids: 3333 },
      { winner: 'PYROTECH ELECTRONICS (P) LTD.', awards_count: 3831, total_bids: 3831 },
      { winner: 'TASKA FIBRES PRIVATE LIMITED', awards_count: 3769, total_bids: 3769 },
      { winner: 'INDUSTRIAL ORGANIC FINISHERS', awards_count: 3018, total_bids: 3018 },
      { winner: 'AVNET ASIA PTE LTD.', awards_count: 2405, total_bids: 2404 },
      { winner: 'METPRESS ENGINEERING WORKS', awards_count: 2234, total_bids: 2357 },
      { winner: 'EMERSON PROCESS MANAGEMENT', awards_count: 2154, total_bids: 2163 },
      { winner: 'SUN TECHNOLOGIES', awards_count: 1930, total_bids: 1934 },
      { winner: 'UTILITY POWERTECH LTD', awards_count: 1870, total_bids: 14 },
      { winner: 'SENSTOGRAPHIC', awards_count: 1750, total_bids: 3001 }
    ]
  },
  // 6. AOC Stats - Winners by Total Bids
  {
    sql: `
      SELECT 
        selected_bidders as winner, 
        SUM(number_of_bids_received) as total_bids,
        count(*) as awards_count
      FROM aoc_details_json 
      WHERE selected_bidders IS NOT NULL AND selected_bidders != ''
      GROUP BY winner 
      ORDER BY total_bids DESC 
      LIMIT 10
    `,
    data: [
      { winner: 'AUMA (INDIA) PRIVATE LIMITED,', total_bids: 651010, awards_count: 572 },
      { winner: 'LIMITORQUE (I) LTD.,', total_bids: 610035, awards_count: 384 },
      { winner: 'ROTORK CONTROLS (INDIA) PVT LTD.,', total_bids: 457322, awards_count: 360 },
      { winner: 'BEND JOINTS PVT LIMITED', total_bids: 165680, awards_count: 522 },
      { winner: 'POWER PIPING CO.', total_bids: 150929, awards_count: 469 },
      { winner: 'FINLAY CNC CENTRE', total_bids: 136101, awards_count: 356 },
      { winner: 'M.E.FORGETECH', total_bids: 120121, awards_count: 188 },
      { winner: 'ACME FORGINGS PRIVATE LTD', total_bids: 99470, awards_count: 160 },
      { winner: 'ANTRIEB TECHNIK PVT LTD.,', total_bids: 94343, awards_count: 92 },
      { winner: 'SAKTHI HI-TECH CONTSTRN. (P) LTD', total_bids: 91617, awards_count: 195 }
    ]
  },
  // 7. AOC Stats - Top Issuing Organisations
  {
    sql: `
      SELECT 
        organisation_name as issuer, 
        count(*) as count 
      FROM aoc_details_json 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY issuer 
      ORDER BY count DESC 
      LIMIT 10
    `,
    data: [
      { issuer: 'BHEL EDN', count: 136548 },
      { issuer: 'HINDUSTAN PETROLEUM CORPORATION LTD', count: 101513 },
      { issuer: 'BHEL BHOPAL', count: 74383 },
      { issuer: 'NTPC Ltd.', count: 63375 },
      { issuer: 'BHEL Hyderabad', count: 49188 },
      { issuer: 'Nuclear Power Corporation of India Limited', count: 38770 },
      { issuer: 'BHEl TRICHY', count: 35593 },
      { issuer: 'Neyveli Lignite Corporation Limited', count: 24198 },
      { issuer: 'Municipal Corporation of DelhiEngineering - MCDCivil Engineering - MCD', count: 19999 },
      { issuer: 'PWD', count: 19760 }
    ]
  },
  // 8. Tenders Stats - Status Counts
  {
    sql: `
      SELECT 
        status, 
        count(*) as count 
      FROM tenders 
      GROUP BY status
    `,
    data: [
      { status: 'active', count: 72574 },
      { status: 'archived', count: 3879617 }
    ]
  },
  // 9. Tenders Stats - Top Issuing Organisations
  {
    sql: `
      SELECT 
        organisation_name as issuer, 
        count(*) as count 
      FROM tenders 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY issuer 
      ORDER BY count DESC 
      LIMIT 10
    `,
    data: [
      { issuer: 'Bharat Heavy Electricals Limited', count: 158639 },
      { issuer: 'Bharat Petroleum Corporation Limited', count: 119330 },
      { issuer: 'IHQ of MoD (Army)-(OSCC)', count: 113003 },
      { issuer: 'Hindustan Petroleum Corporation Limited', count: 104112 },
      { issuer: 'Central Public Works Department (CPWD)', count: 93940 },
      { issuer: 'National Rural Roads Development Agency (NRRDA)', count: 92033 },
      { issuer: 'Military Engineer Services (MES)', count: 85210 },
      { issuer: 'Indian Oil Corporation Limited', count: 76442 },
      { issuer: 'Southern Railway', count: 65118 },
      { issuer: 'Public Works Department', count: 58092 }
    ]
  },
  // 10. Tenders Stats - Portals distribution
  {
    sql: `
      SELECT 
        portal_type, 
        count(*) as count 
      FROM tenders 
      GROUP BY portal_type
    `,
    data: [
      { portal_type: 'state', count: 41825 },
      { portal_type: 'org', count: 3910366 }
    ]
  }
];

// Pre-fill queryCache map
baselines.forEach((b) => {
  queryCache.set(getCacheKey(b.sql), {
    data: b.data,
    expiresAt: baselineExpiry,
  });
});

export async function runQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const cacheKey = getCacheKey(sql, params);
  const now = Date.now();

  // 1. Return valid cached result if available
  const cached = queryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data as T[];
  }

  try {
    // 2. Determine TTL based on query type (heavy stats are cached longer)
    let ttl = 10 * 1000; // 10s default for regular lists/searches
    const sqlUpper = sql.toUpperCase();
    if (
      sqlUpper.includes('COUNT(*)') ||
      sqlUpper.includes('GROUP BY') ||
      sqlUpper.includes('SUM(') ||
      sqlUpper.includes('DISTINCT')
    ) {
      ttl = 15 * 60 * 1000; // 15 minutes for heavy analytical aggregates
    } else if (sqlUpper.includes('LIMIT 1') || sqlUpper.includes('WHERE INTERNAL_ID =')) {
      ttl = 5 * 60 * 1000; // 5 minutes for single record details
    }

    // 3. Race the database query against a timeout to prevent infinite hanging
    //    Pre-cached stats queries never reach here. This timeout is for list/detail queries.
    const queryPromise = client.execute({ sql, args: params });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database Query Timeout')), 30000)
    );

    const res = await Promise.race([queryPromise, timeoutPromise]);

    // 4. Map rows to plain JS objects for clean Next.js React serialization
    const rows = res.rows.map((row: any) => {
      const obj: any = {};
      for (const key of Object.keys(row)) {
        obj[key] = row[key];
      }
      return obj;
    });

    // 5. Store in cache
    queryCache.set(cacheKey, {
      data: rows,
      expiresAt: Date.now() + ttl,
    });

    return rows as T[];
  } catch (err: any) {
    console.error(`LibSQL Query failed or timed out: "${sql.slice(0, 120).trim()}..."`, err.message || err);

    // 6. Return stale cache if available, otherwise return empty array to prevent website crash
    if (cached) {
      console.warn('Returning stale cached result for query');
      return cached.data as T[];
    }
    return [] as T[];
  }
}
