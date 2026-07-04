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
  Award,
  TrendingUp,
  BarChart4,
  Briefcase
} from 'lucide-react';
import { EditorialDivider } from '@/components/SpecimenMark';

interface AocItem {
  internal_id: string;
  portal_type: string;
  year: number;
  sl_no: string;
  aoc_date: string;
  closing_date: string;
  title: string;
  ref_no: string;
  tender_id: string;
  org_name: string;
  detail_url: string;
}

export default function AocExplorerPage() {
  const [aocs, setAocs] = useState<AocItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [portal, setPortal] = useState('');
  const [year, setYear] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Analytics states
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch AOCs on filter changes
  useEffect(() => {
    async function fetchAocs() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(year && { year }),
          ...(portal && { portal }),
          ...(orgFilter && { org: orgFilter }),
        });

        const res = await fetch(`/api/aoc?${queryParams}`);
        if (!res.ok) {
          throw new Error('Failed to fetch contract awards');
        }
        const json = await res.json();
        if (json.success) {
          setAocs(json.data);
          setYears(json.years || []);
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.totalItems);
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading contract awards.');
      } finally {
        setLoading(false);
      }
    }

    fetchAocs();
  }, [page, limit, search, year, portal, orgFilter]);

  // Fetch stats once on mount
  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/aoc/stats');
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
    setPage(1); // Reset to first page
  };

  // Handle Reset filters
  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setYear('');
    setPortal('');
    setOrgInput('');
    setOrgFilter('');
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
            Contract Awards Explorer
          </h1>
          <p className="text-[#2D3A1F]/70 mt-1">Search and inspect closed procurement awards, awarded values, and selected bidders.</p>
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

      {/* Toggleable Specimen Analytics Board */}
      {showAnalytics && (
        <div className="bg-[#EDE8DA] border border-[#D4CFC3] rounded-xl p-6 space-y-6 relative overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 border-b border-[#D4CFC3] pb-3">
            <TrendingUp className="h-5 w-5 text-[#B8A678]" />
            <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
              Specimen Analytics Board
            </h2>
            <span className="text-[10px] font-mono text-[#2D3A1F]/50 ml-auto">DATABASE COLLECTION INDEX: AOC</span>
          </div>

          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-[#2D3A1F] animate-spin" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Winner Companies by Bids */}
              <div className="space-y-3 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg p-4 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/70 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-[#B8A678]" />
                  Most Bids Received
                </h3>
                <div className="divide-y divide-[#CDD2C9] text-xs">
                  {stats.winnersByBids?.map((w: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 gap-2">
                      <span className="truncate font-bold text-[#2D3A1F]/80 max-w-[150px]" title={w.winner}>
                        {idx + 1}. {w.winner}
                      </span>
                      <span className="shrink-0 font-mono font-bold bg-[#E8E2D0] px-1.5 py-0.5 rounded text-[10px]">
                        {formatNumber(Number(w.total_bids))} bids
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Winner Companies by Awards Count */}
              <div className="space-y-3 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg p-4 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/70 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-[#B8A678]" />
                  Most Contracts Awarded
                </h3>
                <div className="divide-y divide-[#CDD2C9] text-xs">
                  {stats.winnersByAwards?.map((w: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 gap-2">
                      <span className="truncate font-bold text-[#2D3A1F]/80 max-w-[150px]" title={w.winner}>
                        {idx + 1}. {w.winner}
                      </span>
                      <span className="shrink-0 font-mono font-bold bg-[#E8E2D0] px-1.5 py-0.5 rounded text-[10px]">
                        {formatNumber(Number(w.awards_count))} awards
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Awarding Agencies */}
              <div className="space-y-3 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg p-4 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3A1F]/70 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#B8A678]" />
                  Top Issuing Agencies
                </h3>
                <div className="divide-y divide-[#CDD2C9] text-xs">
                  {stats.issuers?.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 gap-2">
                      <span className="truncate font-bold text-[#2D3A1F]/80 max-w-[150px]" title={i.issuer}>
                        {idx + 1}. {i.issuer}
                      </span>
                      <span className="shrink-0 font-mono font-bold bg-[#E8E2D0] px-1.5 py-0.5 rounded text-[10px]">
                        {formatNumber(Number(i.count))} entries
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
      <div className="bg-[#E8E2D0] border border-[#CDD2C9] rounded-xl p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <input
                type="text"
                placeholder="Search awards by title, tender ID, reference number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#2D3A1F] placeholder-[#2D3A1F]/50 focus:outline-none focus:border-[#B8A678] focus:ring-1 focus:ring-[#B8A678]/30 transition-all font-semibold"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#2D3A1F]/60" />
            </div>

            {/* Organisation Filter Input */}
            <div className="lg:col-span-3 relative">
              <input
                type="text"
                placeholder="Filter by issuing organisation..."
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#2D3A1F] placeholder-[#2D3A1F]/50 focus:outline-none focus:border-[#B8A678] focus:ring-1 focus:ring-[#B8A678]/30 transition-all font-semibold"
              />
              <Building2 className="absolute left-3 top-3 h-4.5 w-4.5 text-[#2D3A1F]/60" />
            </div>

            {/* Year Filter */}
            <div className="lg:col-span-2">
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-3 py-2.5 text-sm text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
              >
                <option value="">All Years</option>
                {years.map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>

            {/* Portal Type Filter */}
            <div className="lg:col-span-2 flex gap-2">
              <select
                value={portal}
                onChange={(e) => {
                  setPortal(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-[#F4F1E8] border border-[#CDD2C9] rounded-lg px-3 py-2.5 text-sm text-[#2D3A1F] focus:outline-none focus:border-[#B8A678] transition-all font-semibold"
              >
                <option value="">All Portals</option>
                <option value="org">org</option>
                <option value="state">state</option>
              </select>
              
              <button
                type="submit"
                className="bg-[#2D3A1F] hover:bg-[#2D3A1F]/90 text-[#F4F1E8] rounded-lg px-4 py-2.5 text-sm font-bold shadow-sm transition-colors flex items-center justify-center"
              >
                Find
              </button>
              {(search || year || portal || orgFilter) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#F4F1E8] hover:bg-[#E8E2D0] text-[#2D3A1F] border border-[#CDD2C9] rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-[#E8E2D0]/40 border border-[#CDD2C9] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-[#2D3A1F] animate-spin" />
            <span className="text-sm text-[#2D3A1F]/70 font-semibold">Querying millions of awards...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-[#2D3A1F]/80">{error}</div>
        ) : aocs.length === 0 ? (
          <div className="py-20 text-center text-[#2D3A1F]/80">
            <p className="font-bold text-lg" style={{ fontFamily: "var(--font-fraunces)" }}>No contract awards found</p>
            <p className="text-sm text-[#2D3A1F]/60 mt-1">Try broadening your search keywords or resetting filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header info */}
            <div className="px-6 py-4 bg-[#E8E2D0]/50 border-b border-[#CDD2C9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-[#2D3A1F]/70 font-bold tracking-wider uppercase">
                Found {totalItems.toLocaleString()} matching awards
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
                    <th className="px-6 py-3.5">Award / Project Description</th>
                    <th className="px-6 py-3.5">Organisation</th>
                    <th className="px-6 py-3.5">Award Date</th>
                    <th className="px-6 py-3.5">Year</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD2C9]">
                  {aocs.map((aoc) => (
                    <tr key={aoc.internal_id} className="hover:bg-[#E8E2D0]/30 transition-colors group">
                      <td className="px-6 py-4 max-w-md">
                        <div className="space-y-1">
                          <Link 
                            href={`/aoc/${aoc.internal_id}`} 
                            className="font-bold text-sm text-[#2D3A1F] group-hover:text-[#B8A678] hover:underline line-clamp-2 transition-colors"
                          >
                            {aoc.title || 'Untitled Award'}
                          </Link>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {aoc.tender_id && (
                              <span className="flex items-center gap-1 bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded font-medium">
                                <Tag className="h-3 w-3 text-[#B8A678]" />
                                ID: {aoc.tender_id}
                              </span>
                            )}
                            {aoc.ref_no && (
                              <span className="bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded font-medium">
                                Ref: {aoc.ref_no}
                              </span>
                            )}
                            <span className="bg-[#F4F1E8] border border-[#CDD2C9] px-1.5 py-0.5 rounded uppercase font-bold text-[10px] text-[#2D3A1F]/80">
                              {aoc.portal_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2D3A1F]/90 max-w-xs">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-[#B8A678] mt-0.5" />
                          <span className="line-clamp-2 font-medium" title={aoc.org_name}>
                            {aoc.org_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#2D3A1F]/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-[#B8A678]" />
                          <span>{formatDate(aoc.aoc_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#2D3A1F]">
                        {aoc.year || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/aoc/${aoc.internal_id}`}
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
