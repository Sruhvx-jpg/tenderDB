'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  Calendar,
  Building2,
  Tag,
  CircleDot,
  BarChart4,
  TrendingUp,
  CheckCircle,
  Archive,
  Coins,
  Settings2,
  Info
} from 'lucide-react';
import { EditorialDivider } from '@/components/SpecimenMark';

interface TenderItem {
  internal_id: string;
  tender_id: string;
  detail_url: string;
  status: string;
  organisation_name: string;
  title: string;
  reference_number: string;
  portal_type: string;
  e_published_date: string;
  bid_submission_closing_date: string;
  tender_opening_date: string;
  scraped_at: string;
  emd?: string;
  tender_type?: string;
  tender_category?: string;
}

export default function TendersExplorerPage() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Primary Search & Filters state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [portal, setPortal] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [orgInput, setOrgInput] = useState('');

  // Advanced Filters state
  const [emdMin, setEmdMin] = useState('');
  const [emdMinInput, setEmdMinInput] = useState('');
  const [emdMax, setEmdMax] = useState('');
  const [emdMaxInput, setEmdMaxInput] = useState('');
  const [tenderType, setTenderType] = useState('');
  const [tenderCategory, setTenderCategory] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Analytics states
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch tenders on filter changes
  useEffect(() => {
    async function fetchTenders() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(status && { status }),
          ...(portal && { portal }),
          ...(orgFilter && { organisation: orgFilter }),
          ...(tenderType && { tender_type: tenderType }),
          ...(tenderCategory && { tender_category: tenderCategory }),
          ...(emdMin && { emd_min: emdMin }),
          ...(emdMax && { emd_max: emdMax }),
        });

        const res = await fetch(`/api/tenders?${queryParams}`);
        if (!res.ok) {
          throw new Error('Failed to fetch tenders');
        }
        const json = await res.json();
        if (json.success) {
          setTenders(json.data);
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.totalItems);
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading tenders.');
      } finally {
        setLoading(false);
      }
    }

    fetchTenders();
  }, [page, limit, search, status, portal, orgFilter, tenderType, tenderCategory, emdMin, emdMax]);

  // Fetch stats once on mount
  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/tenders/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setOrgFilter(orgInput);
    setEmdMin(emdMinInput);
    setEmdMax(emdMaxInput);
    setPage(1); // Reset to first page
  };

  // Handle Reset filters
  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setPortal('');
    setOrgInput('');
    setOrgFilter('');
    setEmdMinInput('');
    setEmdMin('');
    setEmdMaxInput('');
    setEmdMax('');
    setTenderType('');
    setTenderCategory('');
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.split(' ')[0];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6 text-[#2D3A1F]">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-fraunces)" }}>
            Tenders Explorer
          </h1>
          <p className="text-[#2D3A1F]/70 mt-1">Search and filter active or archived public tenders.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="inline-flex items-center gap-1.5 bg-[#EDE8DA] hover:bg-[#FAF8F2] border border-[#D4CFC3] text-[#2D3A1F] px-4 py-2 rounded-lg text-xs font-medium transition-all"
          >
            <BarChart4 className="h-4 w-4 text-[#C4AD6A]" />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        </div>
      </div>

      {/* Database Update Notice Banner */}
      <div className="bg-[#EDE8DA]/60 border-l-4 border-[#B8A678] text-[#2D3A1F] p-4 rounded-r-lg shadow-sm flex items-start gap-3">
        <Info className="h-5 w-5 text-[#B8A678] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/80" style={{ fontFamily: "var(--font-fraunces)" }}>Database Status</p>
          <p className="text-xs text-[#2D3A1F]/70 mt-0.5">Please note that the database is currently not up-to-date. We will be updating the data in the future.</p>
        </div>
      </div>

      {/* Toggleable Specimen Analytics Board */}
      {showAnalytics && (
        <div className="bg-[#EDE8DA] border border-[#D4CFC3] rounded-xl p-6 space-y-6 relative overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 border-b border-[#D4CFC3] pb-3">
            <TrendingUp className="h-5 w-5 text-[#B8A678]" />
            <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
              Specimen Analytics Board
            </h2>
            <span className="text-[10px] font-mono text-[#2D3A1F]/50 ml-auto">DATABASE COLLECTION INDEX: TENDERS</span>
          </div>

          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-[#2D3A1F] animate-spin" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tenders Status Counts */}
              <div className="space-y-3 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg p-4 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/70 flex items-center gap-1">
                  <CircleDot className="h-3.5 w-3.5 text-[#B8A678]" />
                  Status Distribution
                </h3>
                <div className="space-y-4">
                  {stats.statuses?.map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between font-semibold text-xs">
                      <div className="flex items-center gap-2">
                        {s.status === 'active' ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[#2D3A1F]/40" />
                        )}
                        <span className="capitalize">{s.status || 'unknown'}</span>
                      </div>
                      <span className="font-mono bg-[#E8E2D0] px-1.5 py-0.5 rounded font-bold">
                        {formatNumber(Number(s.count))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Issuing Organisations */}
              <div className="space-y-3 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg p-4 shadow-inner md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/70 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#B8A678]" />
                  Top Issuing Organisations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {stats.issuers?.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[#CDD2C9]/60 last:border-b-0 gap-2 min-w-0">
                      <span className="truncate font-bold text-[#2D3A1F]/80 max-w-[170px]" title={i.issuer}>
                        {idx + 1}. {i.issuer}
                      </span>
                      <span className="shrink-0 font-mono font-bold bg-[#E8E2D0] px-1.5 py-0.5 rounded text-[10px]">
                        {formatNumber(Number(i.count))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#2D3A1F]/60">Failed to load analytics details.</div>
          )}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-[#E8E2D0] border border-[#CDD2C9] rounded-xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px] relative">
              <input
                type="text"
                placeholder="Search by keyword, title, tender ID, reference..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#2D3A1F] placeholder-[#2D3A1F]/50 focus:outline-none focus:border-[#B8A678] focus:ring-1 focus:ring-[#B8A678]/30 transition-all font-semibold"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#2D3A1F]/60" />
            </div>

            {/* Organisation Filter Input */}
            <div className="w-full lg:w-[220px] relative shrink-0">
              <input
                type="text"
                placeholder="Filter by organisation..."
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#2D3A1F] placeholder-[#2D3A1F]/50 focus:outline-none focus:border-[#B8A678] focus:ring-1 focus:ring-[#B8A678]/30 transition-all font-semibold"
              />
              <Building2 className="absolute left-3 top-3 h-4.5 w-4.5 text-[#2D3A1F]/60" />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-[130px] shrink-0">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-3 py-2.5 text-sm text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Portal Type Filter */}
            <div className="w-full lg:w-[150px] flex gap-2 shrink-0">
              <select
                value={portal}
                onChange={(e) => {
                  setPortal(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-2.5 py-2.5 text-sm text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
              >
                <option value="">Portals</option>
                <option value="org">org</option>
                <option value="state">state</option>
              </select>
              
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all shrink-0 ${
                  showAdvanced || emdMin || emdMax || tenderType || tenderCategory
                    ? 'bg-[#B8A678]/20 border-[#B8A678] text-[#2D3A1F]' 
                    : 'bg-[#F4F1E8] border-[#CDD2C9] text-[#2D3A1F]/70'
                }`}
                title="Advanced Specimen Specifications"
              >
                <Settings2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Advanced specifications drawer */}
          {(showAdvanced || emdMin || emdMax || tenderType || tenderCategory) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-[#CDD2C9] animate-fade-in">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D3A1F]/60 mb-1">Tender Category</label>
                <select
                  value={tenderCategory}
                  onChange={(e) => {
                    setTenderCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-3 py-2 text-xs text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
                >
                  <option value="">All Categories</option>
                  <option value="Goods">Goods</option>
                  <option value="Works">Works</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D3A1F]/60 mb-1">Tender Type</label>
                <select
                  value={tenderType}
                  onChange={(e) => {
                    setTenderType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-3 py-2 text-xs text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
                >
                  <option value="">All Types</option>
                  <option value="Open/Advertised">Open/Advertised</option>
                  <option value="Limited">Limited</option>
                  <option value="Single">Single</option>
                  <option value="Expression of Interest">Expression of Interest</option>
                  <option value="Global Tenders">Global Tenders</option>
                  <option value="Open Limited">Open Limited</option>
                </select>
              </div>

              {/* EMD Min */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D3A1F]/60 mb-1">Min EMD (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={emdMinInput}
                    onChange={(e) => setEmdMinInput(e.target.value)}
                    className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#2D3A1F] placeholder-[#2D3A1F]/40 focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
                  />
                  <Coins className="absolute left-2.5 top-2.5 h-3 w-3 text-[#2D3A1F]/50" />
                </div>
              </div>

              {/* EMD Max */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D3A1F]/60 mb-1">Max EMD (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={emdMaxInput}
                    onChange={(e) => setEmdMaxInput(e.target.value)}
                    className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#2D3A1F] placeholder-[#2D3A1F]/40 focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
                  />
                  <Coins className="absolute left-2.5 top-2.5 h-3 w-3 text-[#2D3A1F]/50" />
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#CDD2C9]/60">
            <button
              type="submit"
              className="bg-[#2D3A1F] hover:bg-[#2D3A1F]/90 text-[#F4F1E8] rounded-lg px-5 py-2 text-xs font-bold shadow-sm transition-colors flex items-center justify-center"
            >
              Find Tenders
            </button>
            {(search || status || portal || orgFilter || emdMin || emdMax || tenderType || tenderCategory) && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#F4F1E8] hover:bg-[#E8E2D0] text-[#2D3A1F] border border-[#CDD2C9] rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-[#2D3A1F] animate-spin" />
            <span className="text-sm text-[#2D3A1F]/70 font-semibold">Querying millions of tenders...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-[#2D3A1F]/80">{error}</div>
        ) : tenders.length === 0 ? (
          <div className="py-20 text-center text-[#2D3A1F]/80">
            <p className="font-bold text-lg" style={{ fontFamily: "var(--font-fraunces)" }}>No tenders found</p>
            <p className="text-sm text-[#2D3A1F]/60 mt-1">Try broadening your search keywords or resetting filters.</p>
            <p className="text-xs text-[#2D3A1F]/50 mt-3 font-semibold bg-[#E8E2D0]/50 inline-block px-3 py-1.5 rounded-full border border-[#CDD2C9]/60">
              If no tenders are found, please try reloading the website.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header info */}
            <div className="px-6 py-4 bg-[#E8E2D0]/50 border-b border-[#CDD2C9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-[#2D3A1F]/70 font-bold tracking-wider uppercase">
                Found {totalItems.toLocaleString()} matching tenders
              </span>
              <span className="text-xs text-[#2D3A1F]/60 font-semibold">
                Page {page} of {totalPages}
              </span>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#CDD2C9] bg-[#E8E2D0] text-[#2D3A1F] text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Tender Details</th>
                    <th className="px-6 py-3.5">Organisation</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Key Dates</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD2C9]">
                  {tenders.map((tender) => (
                    <tr key={tender.internal_id} className="hover:bg-[#E8E2D0]/30 transition-colors group">
                      <td className="px-6 py-4 max-w-md">
                        <div className="space-y-1.5">
                          <Link 
                            href={`/tenders/${tender.internal_id}`} 
                            className="font-bold text-sm text-[#2D3A1F] group-hover:text-[#B8A678] hover:underline line-clamp-2 transition-colors"
                          >
                            {tender.title || 'Untitled Tender'}
                          </Link>
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {tender.tender_id && (
                              <span className="flex items-center gap-1 bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded font-medium">
                                <Tag className="h-3 w-3 text-[#B8A678]" />
                                ID: {tender.tender_id}
                              </span>
                            )}
                            {tender.reference_number && (
                              <span className="bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded font-medium">
                                Ref: {tender.reference_number}
                              </span>
                            )}
                            <span className="bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded uppercase font-bold text-[10px] text-[#2D3A1F]/80">
                              {tender.portal_type}
                            </span>
                            {/* Render joined EMD and details if available */}
                            {tender.emd && tender.emd !== '0' && !tender.emd.includes('Not Specified') && (
                              <span className="bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded text-amber-900 font-bold text-[10px]">
                                EMD: {tender.emd}
                              </span>
                            )}
                            {tender.tender_category && (
                              <span className="bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded text-emerald-900 font-bold text-[10px]">
                                {tender.tender_category}
                              </span>
                            )}
                            {tender.tender_type && (
                              <span className="bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded text-[#2D3A1F]/70 font-semibold text-[10px]">
                                {tender.tender_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2D3A1F]/90 max-w-xs">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-[#B8A678] mt-0.5" />
                          <span className="line-clamp-2 font-medium" title={tender.organisation_name}>
                            {tender.organisation_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${
                          tender.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-[#F4F1E8] text-[#2D3A1F]/70 border-[#CDD2C9]'
                        }`}>
                          <CircleDot className="h-3 w-3" />
                          <span className="capitalize">{tender.status || 'unknown'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#2D3A1F]/80 space-y-1 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-[#B8A678]" />
                          <span>Pub: {formatDate(tender.e_published_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-[#B8A678]" />
                          <span>Close: {formatDate(tender.bid_submission_closing_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/tenders/${tender.internal_id}`}
                          className="inline-flex items-center gap-1.5 bg-[#F4F1E8] hover:bg-[#E8E2D0] border border-[#CDD2C9] text-[#2D3A1F] px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          Details
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-[#CDD2C9] flex items-center justify-between bg-[#E8E2D0]/20 gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 bg-[#E8E2D0] border border-[#CDD2C9] px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#2D3A1F] hover:bg-[#F4F1E8] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <div className="text-xs text-[#2D3A1F]/70 font-semibold">
                Page <span className="font-bold text-[#2D3A1F]">{page}</span> of <span className="font-bold text-[#2D3A1F]">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 bg-[#E8E2D0] border border-[#CDD2C9] px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#2D3A1F] hover:bg-[#F4F1E8] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
