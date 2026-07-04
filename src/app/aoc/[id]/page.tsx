import Link from 'next/link';
import { notFound } from 'next/navigation';
import { runQuery } from '@/lib/db';
import WinnerProfile from '@/components/WinnerProfile';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Clock,
  ExternalLink,
  Users,
  Briefcase,
  ShieldAlert
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AocDetailPage({ params }: PageProps) {
  const { id } = await params;

  const query = `
    SELECT a.*, ad.details_json, ad.scraped_at as details_scraped_at
    FROM aoc_tenders a
    LEFT JOIN aoc_details ad ON a.internal_id = ad.internal_id
    WHERE a.internal_id = ?
    LIMIT 1
  `;

  let aoc: any = null;
  try {
    const rows = await runQuery(query, [id]);
    if (rows && rows.length > 0) {
      aoc = rows[0];
    }
  } catch (err) {
    console.error('Failed to load AOC details:', err);
  }

  if (!aoc) {
    notFound();
  }

  // Parse details_json
  let details: any = null;
  if (aoc.details_json) {
    try {
      details = JSON.parse(aoc.details_json);
    } catch (e) {
      console.warn('Failed to parse details_json:', e);
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not Specified';
    return dateStr;
  };

  const formatCurrency = (val: string) => {
    if (!val) return 'Not Specified';
    if (val.trim() === '0') return 'Not Specified';
    return val;
  };

  return (
    <div className="space-y-6 text-[#2D3A1F]">
      {/* Back button */}
      <div>
        <Link 
          href="/aoc" 
          className="inline-flex items-center gap-1.5 text-[#2D3A1F]/70 hover:text-[#2D3A1F] text-sm font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contract Awards
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-[#E8E2D0] border border-[#C8C2B0] rounded-xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-[#2D3A1F] text-[#F4F1E8] px-2.5 py-1 rounded-full font-bold">
            Contract Awarded
          </span>
          <span className="bg-[#F4F1E8] border border-[#C8C2B0] text-[#2D3A1F] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
            {aoc.portal_type} Portal
          </span>
          {aoc.year && (
            <span className="bg-[#F4F1E8] border border-[#C8C2B0] text-[#2D3A1F] px-2.5 py-1 rounded-full font-bold">
              Year: {aoc.year}
            </span>
          )}
        </div>

        <h1 
          className="text-xl md:text-2xl font-bold tracking-tight leading-relaxed text-[#2D3A1F]" 
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {aoc.title || 'Untitled Contract Award'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm pt-2">
          <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
            <Building2 className="h-4 w-4 shrink-0 text-[#B8A678]" />
            <span className="truncate" title={aoc.org_name}>{aoc.org_name || 'Not Specified'}</span>
          </div>
          {aoc.tender_id && (
            <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
              <span className="text-[#2D3A1F]/60 font-bold text-xs border border-[#C8C2B0] px-1.5 py-0.5 rounded bg-[#F4F1E8] shrink-0">TENDER ID</span>
              <span className="font-mono truncate">{aoc.tender_id}</span>
            </div>
          )}
          {aoc.ref_no && (
            <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
              <span className="text-[#2D3A1F]/60 font-bold text-xs border border-[#C8C2B0] px-1.5 py-0.5 rounded bg-[#F4F1E8] shrink-0">REF</span>
              <span className="font-mono truncate">{aoc.ref_no}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2 cols span on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected Bidder Showcase (if details parsed) */}
          {details?.['Name of the selected bidder(s)'] && (
            <div className="space-y-6">
              <div className="bg-[#E8E2D0] border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold tracking-wider text-[#B8A678] uppercase flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#B8A678]" />
                  Winner / Selected Bidder
                </h3>
                <div className="space-y-2">
                  <p 
                    className="text-xl md:text-2xl font-bold text-[#2D3A1F] leading-tight"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {details['Name of the selected bidder(s)']}
                  </p>
                  {details['Address of the selected bidder(s)'] && (
                    <p className="text-[#2D3A1F]/85 text-xs sm:text-sm flex items-start gap-1 font-semibold">
                      <MapPin className="h-4 w-4 text-[#B8A678] shrink-0 mt-0.5" />
                      <span>{details['Address of the selected bidder(s)']}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Corporate Directory Registry Lookups */}
              <WinnerProfile bidderName={details['Name of the selected bidder(s)']} />
            </div>
          )}

          {/* Tender Description Card */}
          <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 
              className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#C8C2B0] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              <FileText className="h-4 w-4 text-[#B8A678]" />
              Award & Contract Description
            </h3>
            <p className="text-[#2D3A1F]/90 text-sm leading-relaxed whitespace-pre-line font-medium">
              {details?.['Tender Description'] || aoc.title || 'No contract description available.'}
            </p>
          </div>

          {/* Details parsed list */}
          {details ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Financial Attributes */}
              <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
                <h3 
                  className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#C8C2B0] pb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  <DollarSign className="h-4 w-4 text-[#B8A678]" />
                  Contract Finance
                </h3>
                <div className="space-y-4 text-sm font-semibold">
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Contract Value</span>
                    <span className="font-bold text-[#2D3A1F] text-xl tracking-tight">
                      {formatCurrency(details['Contract Value'])}
                    </span>
                  </div>
                  {details['Tender Type'] && (
                    <div>
                      <span className="text-[#2D3A1F]/60 block text-xs font-bold">Tender Type</span>
                      <span className="text-[#2D3A1F]">{details['Tender Type']}</span>
                    </div>
                  )}
                  {details['Date of Completion/Completion Period in Days'] && (
                    <div>
                      <span className="text-[#2D3A1F]/60 block text-xs font-bold">Completion Period</span>
                      <span className="text-[#2D3A1F]">{details['Date of Completion/Completion Period in Days']}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bidder Statistics */}
              <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
                <h3 
                  className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#C8C2B0] pb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  <Users className="h-4 w-4 text-[#B8A678]" />
                  Participation Stats
                </h3>
                <div className="space-y-4 text-sm font-semibold">
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Bids Received</span>
                    <span className="text-[#2D3A1F] text-lg">{details['Number of bids received'] || 'Not Specified'}</span>
                  </div>
                  {aoc.sl_no && (
                    <div>
                      <span className="text-[#2D3A1F]/60 block text-xs font-bold">Award Serial Number</span>
                      <span className="font-mono">{aoc.sl_no}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 text-center text-[#2D3A1F]/70 flex flex-col items-center gap-2 shadow-inner">
              <ShieldAlert className="h-8 w-8 text-[#B8A678]" />
              <p className="text-sm font-bold">Detailed attributes (contract values, bidders) are unavailable for this award record.</p>
            </div>
          )}

          {/* Raw JSON View */}
          {details && (
            <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 
                className="text-base font-bold text-[#2D3A1F] border-b border-[#C8C2B0] pb-3"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Raw JSON Schema
              </h3>
              <div className="bg-[#F4F1E8] rounded-lg p-4 border border-[#C8C2B0] overflow-x-auto">
                <pre className="text-xs font-mono text-[#2D3A1F]/90 leading-relaxed max-h-80 overflow-y-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Dates Timeline & Links */}
        <div className="space-y-6">
          {/* Dates Card */}
          <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 
              className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#C8C2B0] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              <Calendar className="h-4 w-4 text-[#B8A678]" />
              Critical Timeline
            </h3>
            
            <div className="space-y-4 text-sm relative border-l border-[#C8C2B0] pl-4 py-1 font-semibold">
              {details?.['Published Date'] && (
                <div>
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-[#B8A678] -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                  <span className="text-[#2D3A1F]/60 block text-xs font-bold">Original Published</span>
                  <span className="text-[#2D3A1F]">{formatDate(details['Published Date'])}</span>
                </div>
              )}
              
              <div>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-rose-600 -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                <span className="text-[#2D3A1F]/60 block text-xs font-bold">Bid Closing Date</span>
                <span className="text-[#2D3A1F]">{formatDate(aoc.closing_date)}</span>
              </div>
              
              <div>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-600 -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                <span className="text-[#2D3A1F]/60 block text-xs font-bold">Contract Awarded (AOC Date)</span>
                <span className="text-[#2D3A1F]">{formatDate(aoc.aoc_date || details?.['Contract Date'])}</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="bg-[#E8E2D0]/40 border border-[#C8C2B0] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 
              className="text-base font-bold text-[#2D3A1F] border-b border-[#C8C2B0] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              External Sources
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-amber-100 border border-amber-300 text-xs text-amber-800 font-bold leading-relaxed mb-1">
                Note: Original portal links are session-scoped and may have expired. Scraped details are preserved below.
              </div>
              {aoc.detail_url && (
                <a 
                  href={aoc.detail_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F4F1E8] border border-[#C8C2B0] hover:border-[#B8A678] hover:text-[#B8A678] transition-all group font-bold text-[#2D3A1F]"
                >
                  <span>AOC Official Document</span>
                  <ExternalLink className="h-4 w-4 text-[#2D3A1F]/60 group-hover:text-[#B8A678] transition-colors" />
                </a>
              )}
              {details?.['Tender Document'] && details?.['Tender Document'] !== aoc.detail_url && (
                <a 
                  href={details['Tender Document']} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F4F1E8] border border-[#C8C2B0] hover:border-[#B8A678] hover:text-[#B8A678] transition-all group font-bold text-[#2D3A1F]"
                >
                  <span>Tender Document</span>
                  <ExternalLink className="h-4 w-4 text-[#2D3A1F]/60 group-hover:text-[#B8A678] transition-colors" />
                </a>
              )}
              <div className="flex items-center gap-1.5 text-[#2D3A1F]/60 text-xs px-1.5 pt-1 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Scraped: {formatDate(aoc.scraped_at || aoc.details_scraped_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
