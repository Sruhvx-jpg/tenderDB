import Link from 'next/link';
import { runQuery } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import { EditorialDivider } from '@/components/SpecimenMark';
import EditorialOrganicElement from '@/components/EditorialOrganicElement';
import EditorialHeroMotion from '@/components/EditorialHeroMotion';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let totalTenders = 0;
  let activeTenders = 0;
  let archivedTenders = 0;
  let totalAoc = 0;
  
  let tendersByPortal: any[] = [];
  let aocByPortal: any[] = [];
  let topOrgs: any[] = [];
  
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM tenders) as total_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'active') as active_tenders,
        (SELECT COUNT(*) FROM tenders WHERE status = 'archived') as archived_tenders,
        (SELECT COUNT(*) FROM aoc_tenders) as total_aoc
    `;

    const tendersByPortalQuery = `
      SELECT portal_type, COUNT(*) as count 
      FROM tenders 
      GROUP BY portal_type
    `;

    const aocByPortalQuery = `
      SELECT portal_type, COUNT(*) as count 
      FROM aoc_tenders 
      GROUP BY portal_type
    `;

    const topOrgsQuery = `
      SELECT organisation_name, COUNT(*) as count 
      FROM tenders 
      WHERE organisation_name IS NOT NULL AND organisation_name != ''
      GROUP BY organisation_name 
      ORDER BY count DESC 
      LIMIT 6
    `;

    // Execute dashboard queries in parallel
    const [statsResult, portalResult, aocResult, orgsResult] = await Promise.all([
      runQuery(statsQuery),
      runQuery(tendersByPortalQuery),
      runQuery(aocByPortalQuery),
      runQuery(topOrgsQuery)
    ]);

    if (statsResult && statsResult.length > 0) {
      totalTenders = Number(statsResult[0].total_tenders || 0);
      activeTenders = Number(statsResult[0].active_tenders || 0);
      archivedTenders = Number(statsResult[0].archived_tenders || 0);
      totalAoc = Number(statsResult[0].total_aoc || 0);
    }

    tendersByPortal = portalResult || [];
    aocByPortal = aocResult || [];
    topOrgs = orgsResult || [];
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="animate-fade-in text-[#2D3A1F]">

      {/* ═══════════════════════════════════════════════
          HERO — Editorial spread with botanical overlay
          ═══════════════════════════════════════════════ */}
      <EditorialHeroMotion>
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-visible">
          {/* Single botanical element — overlaps right side */}
          <EditorialOrganicElement />

          {/* Thin editorial rule — top */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: '0.5px', background: 'var(--border)' }}
          />

          {/* Content — offset left for asymmetry */}
          <div className="relative z-10 max-w-xl">
            {/* Plate number — academic convention */}
            <p
              className="text-[11px] tracking-[0.25em] uppercase mb-6"
              style={{ color: 'var(--forest-40)', fontFamily: 'var(--font-fraunces)' }}
            >
              Pl. I — Procurement Index
            </p>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.08] tracking-tight mb-8 text-shadow-subtle"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Procurement
              <br />
              Analytics &
              <br />
              <span style={{ color: 'var(--champagne)' }}>
                Tender Archive
              </span>
            </h1>

            <p
              className="text-sm md:text-base leading-relaxed max-w-md"
              style={{ color: 'var(--forest-60)' }}
            >
              Complete visibility over public procurement. High-performance
              search across millions of crawled tenders and contract awards.
            </p>
          </div>

          {/* Thin editorial rule — bottom */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: '0.5px', background: 'var(--border)' }}
          />
        </section>
      </EditorialHeroMotion>

      {/* ═══════════════════════════════════════════════
          STATISTICS — Typographic pairs, not cards
          ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <EditorialDivider label="Collection Overview" />

        <div className="mt-12 md:mt-16">
          {/* Asymmetric layout: one hero stat + three supporting */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            {/* Hero stat — large */}
            <div className="md:col-span-5">
              <p
                className="text-[11px] tracking-[0.2em] uppercase mb-3"
                style={{ color: 'var(--forest-40)' }}
              >
                Total Indexed
              </p>
              <p
                className="editorial-number text-6xl md:text-7xl lg:text-8xl"
                style={{ color: 'var(--forest)' }}
              >
                {formatNumber(totalTenders)}
              </p>
              <p
                className="text-xs tracking-[0.15em] uppercase mt-3"
                style={{ color: 'var(--forest-40)' }}
              >
                Tenders Catalogued
              </p>
            </div>

            {/* Supporting stats */}
            <div className="md:col-span-7 flex flex-col justify-end">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p
                    className="editorial-number text-3xl md:text-4xl"
                    style={{ color: 'var(--forest)' }}
                  >
                    {formatNumber(activeTenders)}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.15em] uppercase mt-2"
                    style={{ color: 'var(--forest-40)' }}
                  >
                    Active & Open
                  </p>
                </div>
                <div>
                  <p
                    className="editorial-number text-3xl md:text-4xl"
                    style={{ color: 'var(--forest)' }}
                  >
                    {formatNumber(archivedTenders)}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.15em] uppercase mt-2"
                    style={{ color: 'var(--forest-40)' }}
                  >
                    Archived Records
                  </p>
                </div>
                <div>
                  <p
                    className="editorial-number text-3xl md:text-4xl"
                    style={{ color: 'var(--champagne)' }}
                  >
                    {formatNumber(totalAoc)}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.15em] uppercase mt-2"
                    style={{ color: 'var(--forest-40)' }}
                  >
                    Contract Awards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NAVIGATION — Editorial chapter markers
          ═══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <EditorialDivider label="Explore" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tenders Catalog */}
          <Link
            href="/tenders"
            className="group relative block p-8 md:p-10 rounded-xl bg-[#EDE8DA]/20 border border-[#D4CFC3]/50 hover:bg-[#EDE8DA]/50 hover:border-[#C4AD6A] transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              <p
                className="text-[10px] tracking-[0.25em] uppercase mb-4"
                style={{ color: 'var(--forest-40)' }}
              >
                Chapter I
              </p>
              <h2
                className="text-2xl md:text-3xl font-light tracking-tight mb-3 group-hover:text-[var(--forest)] transition-colors duration-500"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Tenders Catalog
              </h2>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--forest-60)' }}
              >
                Browse millions of advertised tenders. Filter by portal,
                status, and search with sub-second queries.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#2D3A1F]/55 group-hover:text-[#2D3A1F] group-hover:gap-3.5 transition-all duration-500 font-medium">
                Explore Catalog
                <ArrowRight className="h-3.5 w-3.5 text-[#C4AD6A]" />
              </span>
            </div>
          </Link>

          {/* Contract Awards */}
          <Link
            href="/aoc"
            className="group relative block p-8 md:p-10 rounded-xl bg-[#EDE8DA]/20 border border-[#D4CFC3]/50 hover:bg-[#EDE8DA]/50 hover:border-[#C4AD6A] transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              <p
                className="text-[10px] tracking-[0.25em] uppercase mb-4"
                style={{ color: 'var(--forest-40)' }}
              >
                Chapter II
              </p>
              <h2
                className="text-2xl md:text-3xl font-light tracking-tight mb-3 group-hover:text-[var(--forest)] transition-colors duration-500"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Contract Awards
              </h2>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--forest-60)' }}
              >
                Explore awarded contracts, selected bidders, values,
                and completion details across projects.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#2D3A1F]/55 group-hover:text-[#2D3A1F] group-hover:gap-3.5 transition-all duration-500 font-medium">
                Inspect Awards
                <ArrowRight className="h-3.5 w-3.5 text-[#C4AD6A]" />
              </span>
            </div>
          </Link>

          {/* MCP Server - Coming Soon */}
          <div
            className="group relative block p-8 md:p-10 rounded-xl bg-[#EDE8DA]/10 border border-[#D4CFC3]/30 transition-all duration-500 flex flex-col justify-between opacity-80 hover:opacity-100"
          >
            <div>
              <div className="flex justify-between items-start">
                <p
                  className="text-[10px] tracking-[0.25em] uppercase mb-4"
                  style={{ color: 'var(--forest-40)' }}
                >
                  Chapter III
                </p>
                <span className="text-[9px] tracking-wider uppercase font-semibold text-[#C4AD6A] bg-[#EDE8DA] border border-[#D4CFC3]/50 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl font-light tracking-tight mb-3"
                style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--forest-60)' }}
              >
                MCP Server
              </h2>
              <p
                className="text-sm leading-relaxed mb-8 text-[#2D3A1F]/60"
              >
                Connect your LLM agents directly to the shareOSINT.DB database. Query, explore, and analyze procurement records using Model Context Protocol.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#2D3A1F]/40 font-medium cursor-not-allowed">
                Integration Docs
                <span className="h-1.5 w-1.5 rounded-full bg-[#C4AD6A]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DATA SECTIONS — Editorial presentation
          ═══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <EditorialDivider label="Distribution & Analysis" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Portal Distribution — left column, wider */}
          <div className="lg:col-span-7 bg-[#EDE8DA]/25 border border-[#D4CFC3]/60 rounded-xl p-8 md:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <h3
                className="text-xl font-light tracking-tight mb-8"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Portal Distribution
              </h3>

              {/* Tenders portals */}
              <div className="space-y-6">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase font-semibold"
                  style={{ color: 'var(--forest-40)' }}
                >
                  Tenders by Source
                </p>
                {tendersByPortal.map((item: any) => {
                  const count = Number(item.count);
                  const percent = totalTenders ? ((count / totalTenders) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.portal_type} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--forest-60)' }}
                        >
                          {item.portal_type || 'Unknown'}
                        </span>
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{
                            color: 'var(--forest)',
                          }}
                        >
                          {formatNumber(count)}
                          <span className="ml-2 text-[10px]" style={{ color: 'var(--forest-40)' }}>({percent}%)</span>
                        </span>
                      </div>
                      <div
                        className="h-3 w-full overflow-hidden rounded-full border border-[#D4CFC3]/40"
                        style={{ background: 'var(--ivory)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percent}%`,
                            background: 'var(--forest)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AOC portals */}
              <div className="space-y-6 mt-10">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase font-semibold"
                  style={{ color: 'var(--forest-40)' }}
                >
                  Contract Awards by Source
                </p>
                {aocByPortal.map((item: any) => {
                  const count = Number(item.count);
                  const percent = totalAoc ? ((count / totalAoc) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.portal_type} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--forest-60)' }}
                        >
                          {item.portal_type || 'Unknown'}
                        </span>
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{
                            color: 'var(--forest)',
                          }}
                        >
                          {formatNumber(count)}
                          <span className="ml-2 text-[10px]" style={{ color: 'var(--forest-40)' }}>({percent}%)</span>
                        </span>
                      </div>
                      <div
                        className="h-3 w-full overflow-hidden rounded-full border border-[#D4CFC3]/40"
                        style={{ background: 'var(--ivory)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percent}%`,
                            background: 'var(--champagne)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Issuers — right column */}
          <div className="lg:col-span-5 bg-[#EDE8DA]/25 border border-[#D4CFC3]/60 rounded-xl p-8 md:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <h3
                className="text-xl font-light tracking-tight mb-8"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Top Tender Issuers
              </h3>

              <div className="space-y-1">
                {topOrgs.map((org: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3.5 border-b border-[#D4CFC3]/30 last:border-0"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className="text-base tabular-nums shrink-0 font-light"
                        style={{
                          color: 'var(--forest-40)',
                          fontFamily: 'var(--font-fraunces)',
                          minWidth: '1.5rem',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p
                        className="text-xs font-semibold truncate"
                        title={org.organisation_name}
                        style={{ color: 'var(--forest-60)' }}
                      >
                        {org.organisation_name}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] tracking-[0.15em] font-semibold uppercase ml-4 px-2 py-0.5 rounded border border-[#D4CFC3]/50 bg-[#FAF8F2]"
                      style={{ color: 'var(--forest)' }}
                    >
                      {formatNumber(Number(org.count))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial close */}
      <div className="py-8">
        <EditorialDivider />
      </div>
    </div>
  );
}
