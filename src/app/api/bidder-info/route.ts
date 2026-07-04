import { NextResponse } from "next/server";
import https from "https";

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    };
    
    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  try {
    // Clean bidder name for queries (remove trailing commas, "M/S", etc.)
    const cleanName = name
      .replace(/^M\/S\s+/i, "")
      .replace(/,.*$/, "")
      .replace(/\s+Ltd\.?$/i, "")
      .replace(/\s+Pvt\.?$/i, "")
      .replace(/\s+Private\s+Limited$/i, "")
      .trim();

    // 1. Search Yahoo for the IndiaFilings page of this company
    const searchQuery = `site:indiafilings.com ${cleanName}`;
    const searchUrl = `https://search.yahoo.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    let searchHtml = "";
    try {
      searchHtml = await httpsGet(searchUrl);
    } catch (err: any) {
      console.error("Yahoo search failed:", err);
      return NextResponse.json({ error: `Yahoo search request failed: ${err.message}` }, { status: 500 });
    }

    // 2. Extract IndiaFilings URL (including within Yahoo redirect wrapper)
    const hrefRegex = /href="([^"]+)"/gi;
    let hrefMatch;
    const candidates: string[] = [];

    while ((hrefMatch = hrefRegex.exec(searchHtml)) !== null) {
      const rawUrl = hrefMatch[1];
      const decodedUrl = decodeURIComponent(rawUrl);
      
      // Look for indiafilings.com/search/ company pages
      if (decodedUrl.includes("indiafilings.com/search/")) {
        let actualUrl = decodedUrl;
        if (decodedUrl.includes("/RU=")) {
          const parts = decodedUrl.split("/RU=");
          if (parts.length > 1) {
            actualUrl = parts[1].split("/RK=")[0].split("/RS=")[0];
          }
        }
        
        // Clean any double-urlencoding or trailing parameters
        const cleanUrl = actualUrl.split("&")[0];
        if (cleanUrl.startsWith("http") && !candidates.includes(cleanUrl)) {
          candidates.push(cleanUrl);
        }
      }
    }

    let profileUrl = candidates.find(c => c.includes("-cin-")) || candidates[0];

    if (!profileUrl) {
      return NextResponse.json({ 
        success: false, 
        message: "Company profile page not found on IndiaFilings." 
      });
    }

    // 3. Fetch IndiaFilings company profile page
    let html = "";
    try {
      html = await httpsGet(profileUrl);
    } catch (err: any) {
      console.error("IndiaFilings profile fetch failed:", err);
      return NextResponse.json({ error: `IndiaFilings profile request failed: ${err.message}` }, { status: 500 });
    }

    // 4. Parse the details from the IndiaFilings HTML
    // Extract CIN
    const cinMatch = html.match(/[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/i);
    const cin = cinMatch ? cinMatch[0].toUpperCase() : "";

    // Extract Company Name
    const nameMatch = html.match(/<h1>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)\|/i);
    const companyName = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, "").trim() : name;

    // Helper to extract fields from JSON
    const getJsonField = (key: string): string => {
      const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, "i");
      const match = html.match(regex);
      return match ? match[1].trim() : "";
    };

    // Helper to parse table cell values
    const parseTableCell = (label: string): string => {
      const regex = new RegExp(`<td[^>]*>\\s*${label}\\s*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "i");
      const match = html.match(regex);
      return match ? match[1].replace(/<[^>]*>/g, "").trim() : "";
    };

    // Extract fields
    const address = parseTableCell("Registered Address") || getJsonField("streetAddress") || getJsonField("address");
    const email = parseTableCell("Email Id") || getJsonField("email");
    const listed = parseTableCell("Whether Listed or not") || getJsonField("listed");
    const suspended = parseTableCell("Suspended at stock exchange") || getJsonField("suspended_at_stock_exchange");
    const status = parseTableCell("Company Status \\(for e-filing\\)") || parseTableCell("Company Status") || getJsonField("legalStatus") || getJsonField("company_status") || "Active";
    
    // Capital info using robust non-digit lazy match
    const authMatch = html.match(/(?:authorised|authorized)\s+(?:share\s+)?capital\s+of\s+[^0-9]*?([0-9,]+)/i);
    const paidMatch = html.match(/paid-up\s+(?:share\s+)?capital\s+of\s+[^0-9]*?([0-9,]+)/i);
    const authorisedCapital = authMatch ? authMatch[1] : getJsonField("authorised_capital");
    const paidUpCapital = paidMatch ? paidMatch[1] : getJsonField("paid_up_capital");

    // Incorporation Date
    const incMatch = html.match(/incorporated on\s*([0-9a-zA-Z\s-]+?)(?:\.|\s+and)/i);
    const incorporationDate = incMatch ? incMatch[1].trim() : (getJsonField("foundingDate") || getJsonField("date_of_incorporation"));

    // ROC and Subcategory
    const rocMatch = html.match(/RoC-[a-zA-Z]+/i) || html.match(/Registrar of Companies\s+([^.,\n]+)/i);
    const roc = rocMatch ? rocMatch[0].trim() : (getJsonField("roc_code") || getJsonField("roc"));
    const subcategory = getJsonField("company_subcategory") || getJsonField("subcategory") || "Private Company";

    // Parse Directors Table
    interface DirectorInfo {
      din: string;
      name: string;
      beginDate: string;
    }
    const directors: DirectorInfo[] = [];
    const startIdx = html.indexOf("Directors / Signatory Details");
    if (startIdx !== -1) {
      const sub = html.slice(startIdx, startIdx + 5000);
      const tableIdx = sub.indexOf("<table");
      const tableEndIdx = sub.indexOf("</table>");
      if (tableIdx !== -1 && tableEndIdx !== -1) {
        const tableHtml = sub.slice(tableIdx, tableEndIdx + 8);
        const rows = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

        for (const row of rows) {
          if (row.toLowerCase().includes("din / pan") || row.toLowerCase().includes("begin date")) {
            continue;
          }
          const cols = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
          if (cols.length >= 2) {
            const col0 = cols[0];
            const col1 = cols[1];
            const col2 = cols[2];
            if (col0 && col1) {
              const din = col0.replace(/<[^>]*>/g, "").trim();
              const dName = col1.replace(/<[^>]*>/g, "").trim();
              const beginDate = col2 ? col2.replace(/<[^>]*>/g, "").trim() : "";
              if (dName && din) {
                directors.push({ din, name: dName, beginDate });
              }
            }
          }
        }
      }
    }

    // Fallback if table parse fails
    if (directors.length === 0) {
      const dirRegex1 = /"director_name"\s*:\s*"([^"]+)"/gi;
      let dMatch;
      while ((dMatch = dirRegex1.exec(html)) !== null) {
        const dName = dMatch[1].trim();
        if (dName && !directors.some(d => d.name === dName)) {
          directors.push({ din: "", name: dName, beginDate: "" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        name: companyName,
        cin,
        incorporationDate,
        status,
        subcategory,
        authorisedCapital: authorisedCapital ? authorisedCapital.replace(/Rs\.?\s*/i, "").trim() : "",
        paidUpCapital: paidUpCapital ? paidUpCapital.replace(/Rs\.?\s*/i, "").trim() : "",
        roc,
        address,
        email,
        listed,
        suspended,
        directors,
        sourceUrl: profileUrl,
      },
    });
  } catch (error: any) {
    console.error("Error in bidder-info endpoint:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bidder info" }, { status: 500 });
  }
}
