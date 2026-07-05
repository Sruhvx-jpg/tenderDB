import Link from 'next/link';
import { notFound } from 'next/navigation';
import { runQuery } from '@/lib/db';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Globe,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { EditorialDivider } from '@/components/SpecimenMark';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenderDetailPage({ params }: PageProps) {
  const { id } = await params;

  let tender: any = null;
  try {
    const baseRows = await runQuery(
      `SELECT * FROM tenders WHERE internal_id = ? LIMIT 1`,
      [id]
    );
    if (baseRows && baseRows.length > 0) {
      tender = baseRows[0];
      
      // Attempt to load details separately to avoid blocking on slow joins
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
    }
  } catch (err) {
    console.error('Failed to load tender details:', err);
  }

  if (!tender) {
    notFound();
  }

  // Parse details_json
  let details: any = null;
  if (tender.details_json) {
    try {
      details = JSON.parse(tender.details_json);
    } catch (e) {
      console.warn('Failed to parse details_json:', e);
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not Specified';
    return dateStr;
  };

  return (
    <div className="space-y-6 text-[#2D3A1F]">
      {/* Back button */}
      <div>
        <Link 
          href="/tenders" 
          className="inline-flex items-center gap-1.5 text-[#2D3A1F]/70 hover:text-[#2D3A1F] text-sm font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenders Catalog
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-[#E8E2D0] border border-[#CDD2C9] rounded-xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${
            tender.status === 'active' 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-[#F4F1E8] text-[#2D3A1F]/70 border-[#CDD2C9]'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tender.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-zinc-550'}`} />
            <span className="capitalize">{tender.status}</span>
          </span>
          <span className="bg-[#F4F1E8] border border-[#CDD2C9] text-[#2D3A1F] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
            {tender.portal_type} Portal
          </span>
          <span className="bg-[#EDE8DA] border border-[#D4CFC3] text-[#2D3A1F]/70 px-2.5 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase font-medium">
            {tender.tender_id ? tender.tender_id.substring(0, 10) : 'TNDR'}
          </span>
        </div>

        <h1 
          className="text-xl md:text-2xl font-bold tracking-tight leading-relaxed text-[#2D3A1F]"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {tender.title || 'Untitled Tender'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm pt-2">
          <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
            <Building2 className="h-4 w-4 shrink-0 text-[#B8A678]" />
            <span className="truncate">{tender.organisation_name || 'Not Specified'}</span>
          </div>
          {tender.tender_id && (
            <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
              <span className="text-[#2D3A1F]/60 font-bold text-xs border border-[#CDD2C9] px-1.5 py-0.5 rounded bg-[#F4F1E8] shrink-0">ID</span>
              <span className="font-mono truncate">{tender.tender_id}</span>
            </div>
          )}
          {tender.reference_number && (
            <div className="flex items-center gap-2 text-[#2D3A1F]/85 font-semibold">
              <span className="text-[#2D3A1F]/60 font-bold text-xs border border-[#CDD2C9] px-1.5 py-0.5 rounded bg-[#F4F1E8] shrink-0">REF</span>
              <span className="font-mono truncate">{tender.reference_number}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2 cols span on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Description Card */}
          <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm relative">
            <h3 
              className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#CDD2C9] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              <FileText className="h-4 w-4 text-[#B8A678]" />
              Work Description
            </h3>
            <p className="text-[#2D3A1F]/90 text-sm leading-relaxed whitespace-pre-line font-medium">
              {details?.['Work Description'] || tender.title || 'No detailed description available.'}
            </p>
          </div>

          {/* Details parsed list */}
          {details ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Financial Attributes */}
              <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
                <h3 
                  className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#CDD2C9] pb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  <DollarSign className="h-4 w-4 text-[#B8A678]" />
                  Financial Details
                </h3>
                <div className="space-y-4 text-sm font-semibold">
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Earnest Money Deposit (EMD)</span>
                    <span className="text-[#2D3A1F] text-base">{details['EMD'] || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Tender Fee</span>
                    <span className="text-[#2D3A1F]">{details['Tender Fee'] || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Tender Type</span>
                    <span className="text-[#2D3A1F] capitalize">{details['Tender Type'] || 'Not Specified'}</span>
                  </div>
                </div>
              </div>

              {/* Classification Attributes */}
              <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
                <h3 
                  className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#CDD2C9] pb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  <Globe className="h-4 w-4 text-[#B8A678]" />
                  Classification
                </h3>
                <div className="space-y-4 text-sm font-semibold">
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Tender Category</span>
                    <span className="text-[#2D3A1F]">{details['Tender Category'] || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Product Category</span>
                    <span className="text-[#2D3A1F]">{details['Product Category'] || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Location</span>
                    <span className="text-[#2D3A1F] flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#B8A678] shrink-0 mt-0.5" />
                      <span>{details['Location'] || 'Not Specified'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 text-center text-[#2D3A1F]/70 flex flex-col items-center gap-2 shadow-inner">
              <ShieldAlert className="h-8 w-8 text-[#B8A678]" />
              <p className="text-sm font-bold">Detailed attributes (EMD, categories) are unavailable for this tender.</p>
            </div>
          )}

          {/* Raw JSON View */}
          {details && (
            <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 
                className="text-base font-bold text-[#2D3A1F] border-b border-[#CDD2C9] pb-3"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Raw JSON Schema
              </h3>
              <div className="bg-[#F4F1E8] rounded-lg p-4 border border-[#CDD2C9] overflow-x-auto">
                <pre className="text-xs font-mono text-[#2D3A1F]/90 leading-relaxed max-h-80 overflow-y-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Dates Timeline & Contact Info */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 
              className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#CDD2C9] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              <Calendar className="h-4 w-4 text-[#B8A678]" />
              Critical Timeline
            </h3>
            
            <div className="space-y-4 text-sm relative border-l border-[#CDD2C9] pl-4 py-1 font-semibold">
              <div>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-[#B8A678] -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                <span className="text-[#2D3A1F]/60 block text-xs font-bold">Published Date</span>
                <span className="text-[#2D3A1F]">{formatDate(tender.e_published_date || details?.['ePublished Date'])}</span>
              </div>
              
              {details?.['Bid Submission Start Date'] && (
                <div>
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-slate-500 -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                  <span className="text-[#2D3A1F]/60 block text-xs font-bold">Bid Submission Start</span>
                  <span className="text-[#2D3A1F]">{formatDate(details['Bid Submission Start Date'])}</span>
                </div>
              )}
              
              <div>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-rose-600 -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                <span className="text-[#2D3A1F]/60 block text-xs font-bold">Closing / Submission End</span>
                <span className="text-[#2D3A1F]">{formatDate(tender.bid_submission_closing_date || details?.['Bid Submission End Date'])}</span>
              </div>
              
              <div>
                <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-600 -left-1.25 border-2 border-[#F4F1E8] mt-1" />
                <span className="text-[#2D3A1F]/60 block text-xs font-bold">Bid Opening Date</span>
                <span className="text-[#2D3A1F]">{formatDate(tender.tender_opening_date || details?.['Bid Opening Date'])}</span>
              </div>
            </div>
          </div>

          {/* Contact / Issuer Card */}
          {details?.['Name'] && (
            <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 
                className="text-base font-bold text-[#2D3A1F] flex items-center gap-2 border-b border-[#CDD2C9] pb-3"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                <Building2 className="h-4 w-4 text-[#B8A678]" />
                Issuer Contact
              </h3>
              <div className="space-y-4 text-sm font-semibold">
                <div>
                  <span className="text-[#2D3A1F]/60 block text-xs font-bold">Contact Person</span>
                  <span className="text-[#2D3A1F]">{details['Name']}</span>
                </div>
                {details['Address'] && (
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Address</span>
                    <span className="text-[#2D3A1F] whitespace-pre-line leading-relaxed">{details['Address']}</span>
                  </div>
                )}
                {details['Organisation Type'] && (
                  <div>
                    <span className="text-[#2D3A1F]/60 block text-xs font-bold">Organisation Type</span>
                    <span className="text-[#2D3A1F]">{details['Organisation Type']}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 
              className="text-base font-bold text-[#2D3A1F] border-b border-[#CDD2C9] pb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              External Sources
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-amber-100 border border-amber-300 text-xs text-amber-800 font-bold leading-relaxed mb-1">
                Note: Original portal links are session-scoped and may have expired. Scraped details are preserved below.
              </div>
              {tender.detail_url && (
                <a 
                  href={tender.detail_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F4F1E8] border border-[#CDD2C9] hover:border-[#B8A678] hover:text-[#B8A678] transition-all group font-bold text-[#2D3A1F]"
                >
                  <span>Tender Document / Page</span>
                  <ExternalLink className="h-4 w-4 text-[#2D3A1F]/60 group-hover:text-[#B8A678] transition-colors" />
                </a>
              )}
              {tender.corrigendum_url && (
                <a 
                  href={tender.corrigendum_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F4F1E8] border border-[#CDD2C9] hover:border-[#B8A678] hover:text-[#B8A678] transition-all group font-bold text-[#2D3A1F]"
                >
                  <span>Corrigendum Document</span>
                  <ExternalLink className="h-4 w-4 text-[#2D3A1F]/60 group-hover:text-[#B8A678] transition-colors" />
                </a>
              )}
              <div className="flex items-center gap-1.5 text-[#2D3A1F]/60 text-xs px-1.5 pt-1 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Scraped: {formatDate(tender.scraped_at || tender.details_scraped_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
