"use client";

import { useState, useEffect } from "react";
import { 
  Building, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  ExternalLink,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";

interface WinnerProfileProps {
  bidderName: string;
}

interface DirectorInfo {
  din: string;
  name: string;
  beginDate: string;
}

interface BidderData {
  name: string;
  cin: string;
  incorporationDate: string;
  status: string;
  subcategory: string;
  authorisedCapital: string;
  paidUpCapital: string;
  roc: string;
  address: string;
  email: string;
  listed: string;
  suspended: string;
  directors: DirectorInfo[];
  sourceUrl: string;
}

export default function WinnerProfile({ bidderName }: WinnerProfileProps) {
  const [data, setData] = useState<BidderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchInfo() {
      try {
        setLoading(true);
        setError(null);
        
        let cleanName = bidderName
          .replace(/^M\/S\s+/i, "")
          .replace(/,.*$/, "")
          .trim();

        const res = await fetch(`/api/bidder-info?name=${encodeURIComponent(cleanName)}`);
        if (!res.ok) {
          throw new Error("Failed to load corporate directory profile.");
        }
        
        const json = await res.json();
        if (active) {
          if (json.success && json.data && json.data.cin) {
            setData(json.data);
          } else {
            setError(json.message || "Bidder profile not found in public directory.");
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "An error occurred matching company profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (bidderName) {
      fetchInfo();
    }

    return () => {
      active = false;
    };
  }, [bidderName]);

  if (loading) {
    return (
      <div className="bg-[#E8E2D0] border border-[#C8C2B0] rounded-xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#2D3A1F]" />
          <div className="h-4 bg-[#C8C2B0] rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[#C8C2B0] rounded w-full"></div>
          <div className="h-3 bg-[#C8C2B0] rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#E8E2D0] border border-[#C8C2B0] rounded-xl p-6 text-[#2D3A1F] text-sm flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[#B8A678] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#2D3A1F]" style={{ fontFamily: "'Fraunces', serif" }}>
            Winner Corporate Profile Offline
          </p>
          <p className="text-[#2D3A1F]/80 text-xs mt-1" style={{ fontFamily: "'Sora', sans-serif" }}>
            Could not retrieve registry details for &ldquo;{bidderName}&rdquo;. The company may be unregistered, an individual proprietor, or registered under a different legal name.
          </p>
        </div>
      </div>
    );
  }

  const isStatusActive = data.status.toLowerCase() === "active";

  return (
    <>
      {/* Import Google Fonts dynamically */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Sora:wght@100..800&display=swap" 
        rel="stylesheet" 
      />

      <div 
        className="bg-[#F4F1E8] border border-[#C8C2B0] rounded-xl p-6 md:p-8 space-y-6 shadow-md text-[#2D3A1F]"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C8C2B0] pb-5">
          <div className="space-y-1.5">
            <h3 
              className="text-xs font-bold uppercase tracking-wider text-[#B8A678] flex items-center gap-1.5"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <Building className="h-3.5 w-3.5" />
              Verified Registry Details (IndiaFilings)
            </h3>
            <h2 
              className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-[#2D3A1F]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {data.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono bg-[#E8E2D0] border border-[#C8C2B0] text-[#2D3A1F] px-2 py-0.5 rounded">
                CIN: {data.cin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#E8E2D0] border border-[#C8C2B0] px-3 py-1.5 rounded-lg">
            <span className={`h-2.5 w-2.5 rounded-full ${isStatusActive ? "bg-emerald-600 animate-pulse" : "bg-amber-600"}`} />
            <span className="text-xs font-bold capitalize text-[#2D3A1F]">{data.status}</span>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Date of Incorporation</span>
            <div className="flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span>{data.incorporationDate || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">ROC Location</span>
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span className="truncate" title={data.roc}>{data.roc || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Company Category</span>
            <div className="flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span>{data.subcategory || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Authorised Capital</span>
            <div className="flex items-center gap-1.5 font-semibold">
              <DollarSign className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span>₹{data.authorisedCapital || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Paid Up Capital</span>
            <div className="flex items-center gap-1.5 font-semibold">
              <DollarSign className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span>₹{data.paidUpCapital || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Listing Status</span>
            <div className="flex items-center gap-2 font-semibold">
              <FileSpreadsheet className="h-4 w-4 text-[#B8A678] shrink-0" />
              <span>{data.listed || "Not Specified"}</span>
            </div>
          </div>
        </div>

        {/* Address & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-[#C8C2B0]">
          <div className="space-y-1">
            <span className="text-[#2D3A1F]/60 text-xs block font-bold">Registered Address</span>
            <div className="flex items-start gap-2 text-xs leading-relaxed">
              <MapPin className="h-4 w-4 text-[#B8A678] shrink-0 mt-0.5" />
              <span>{data.address || "Not Specified"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[#2D3A1F]/60 text-xs block font-bold">Official Email</span>
              {data.email ? (
                <a 
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-2 text-[#2D3A1F] hover:text-[#B8A678] font-semibold text-xs transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#B8A678] shrink-0" />
                  <span className="underline decoration-[#C8C2B0] underline-offset-4">{data.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-[#2D3A1F]/80 text-xs">
                  <Mail className="h-4 w-4 text-[#B8A678] shrink-0" />
                  <span>Not Specified</span>
                </div>
              )}
            </div>

            {data.suspended && data.suspended !== "N" && (
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-lg w-fit">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Stock Exchange Suspension: {data.suspended}</span>
              </div>
            )}
          </div>
        </div>

        {/* Directors Section */}
        <div className="border-t border-[#C8C2B0] pt-5 space-y-3">
          <h4 
            className="text-xs font-bold uppercase tracking-wider text-[#B8A678] flex items-center gap-1.5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <User className="h-3.5 w-3.5" />
            Active Directors ({data.directors.length})
          </h4>

          {data.directors.length > 0 ? (
            <div className="overflow-x-auto border border-[#C8C2B0] rounded-lg">
              <table className="min-w-full divide-y divide-[#C8C2B0] text-left text-xs">
                <thead className="bg-[#E8E2D0] text-[#2D3A1F] font-bold">
                  <tr>
                    <th className="px-4 py-2.5">DIN / PAN</th>
                    <th className="px-4 py-2.5" style={{ fontFamily: "'Fraunces', serif" }}>Director Name</th>
                    <th className="px-4 py-2.5">Appointment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8C2B0] bg-[#F4F1E8] text-[#2D3A1F]">
                  {data.directors.map((director, idx) => (
                    <tr key={idx} className="hover:bg-[#E8E2D0]/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium">
                        {director.din || "Not Specified"}
                      </td>
                      <td className="px-4 py-2.5 font-bold">
                        {director.name}
                      </td>
                      <td className="px-4 py-2.5">
                        {director.beginDate || "Not Specified"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#2D3A1F]/60 italic">No listed director filings available for this record.</p>
          )}
        </div>

        {/* Source Citation */}
        <div className="border-t border-[#C8C2B0] pt-4 flex items-center justify-between text-xs text-[#2D3A1F]/70">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Registry matches fully resolved
          </span>
          <a 
            href={data.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:text-[#B8A678] text-[#2D3A1F] transition-colors font-bold underline decoration-[#C8C2B0] underline-offset-4"
          >
            <span>View on IndiaFilings</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </>
  );
}
