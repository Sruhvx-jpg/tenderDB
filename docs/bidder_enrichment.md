# Bidder Profile Enrichment Documentation

TenderDB enriches contract award winner listings by dynamically retrieving official corporate registration profiles (including registration dates, capital, ROC, and active directors) from IndiaFilings. This document outlines the query, redirect extraction, and HTML scraping flow.

---

## 1. Request Cleaning
Before executing queries, the bidder or company name is cleaned to strip out prefixes, suffixes, and punctuation that might lead to search misses (e.g. `M/S`, `Pvt Ltd`, trailing text after commas):

```typescript
const cleanName = name
  .replace(/^M\/S\s+/i, "")         // Remove prefix "M/S"
  .replace(/,.*$/, "")              // Remove anything after a comma
  .replace(/\s+Ltd\.?$/i, "")       // Remove trailing "Ltd"
  .replace(/\s+Pvt\.?$/i, "")       // Remove trailing "Pvt"
  .replace(/\s+Private\s+Limited$/i, "") // Remove trailing "Private Limited"
  .trim();
```

---

## 2. Yahoo Search & Redirect Extraction
To locate the exact profile page without using premium scraper APIs, the system queries Yahoo Search with a site constraint. 

### Search Query
```typescript
const searchQuery = `site:indiafilings.com ${cleanName}`;
const searchUrl = `https://search.yahoo.com/search?q=${encodeURIComponent(searchQuery)}`;
```

### Redirect Parsing
Yahoo wraps outbound links in redirect trackers. The scraper parses these URLs to extract the actual IndiaFilings company landing page:

```typescript
const hrefRegex = /href="([^"]+)"/gi;
let hrefMatch;
const candidates: string[] = [];

while ((hrefMatch = hrefRegex.exec(searchHtml)) !== null) {
  const rawUrl = hrefMatch[1];
  const decodedUrl = decodeURIComponent(rawUrl);
  
  if (decodedUrl.includes("indiafilings.com/search/")) {
    let actualUrl = decodedUrl;
    // Extract actual URL out of Yahoo RU redirect wrapper
    if (decodedUrl.includes("/RU=")) {
      const parts = decodedUrl.split("/RU=");
      if (parts.length > 1) {
        actualUrl = parts[1].split("/RK=")[0].split("/RS=")[0];
      }
    }
    const cleanUrl = actualUrl.split("&")[0];
    if (cleanUrl.startsWith("http") && !candidates.includes(cleanUrl)) {
      candidates.push(cleanUrl);
    }
  }
}
```

---

## 3. Profile Parsing & Scraping

Once the IndiaFilings profile URL is resolved, the endpoint scrapes the page and extracts the corporate facts using regex patterns.

### Key RegEx Parsers

* **Corporate Identification Number (CIN)**:
  Matches standard Indian 21-digit CIN alphanumeric format:
  ```typescript
  const cinMatch = html.match(/[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/i);
  ```

* **Company Status & Registry Details**:
  Matches table cell tags or metadata fields:
  ```typescript
  const parseTableCell = (label: string): string => {
    const regex = new RegExp(`<td[^>]*>\\s*${label}\\s*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "i");
    const match = html.match(regex);
    return match ? match[1].replace(/<[^>]*>/g, "").trim() : "";
  };
  ```

* **Authorised & Paid-Up Capital**:
  Extracts rupee values by searching near target terminology:
  ```typescript
  const authMatch = html.match(/(?:authorised|authorized)\s+(?:share\s+)?capital\s+of\s+[^0-9]*?([0-9,]+)/i);
  const paidMatch = html.match(/paid-up\s+(?:share\s+)?capital\s+of\s+[^0-9]*?([0-9,]+)/i);
  ```

* **Directors Table**:
  Parses the HTML table inside the `"Directors / Signatory Details"` section to map active DINs, names, and appointment start dates.

---

## 4. API Usage
* **Endpoint**: `/api/bidder-info`
* **Query Params**: `?name=COMPANY_NAME`
* **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "name": "BHARAT HEAVY ELECTRICALS LTD",
      "cin": "L74899DL1964GOI004281",
      "incorporationDate": "13 November 1964",
      "status": "Active",
      "authorisedCapital": "20,000,000,000",
      "paidUpCapital": "6,964,057,750",
      "roc": "RoC-Delhi",
      "address": "BHEL HOUSE, SIRI FORT, NEW DELHI, Delhi, 110049",
      "directors": [
        { "din": "08523992", "name": "KOPPUPRASHANTHI", "beginDate": "19 August 2019" }
      ]
    }
  }
  ```
