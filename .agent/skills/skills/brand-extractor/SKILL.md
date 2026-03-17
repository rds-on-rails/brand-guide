---
name: brand-extractor
description: Extract brand identity, site structure, and business offerings from any existing website. Use this skill when the user provides a URL and wants to extract brand guidelines (colors, fonts, logos, favicons), navigation structure, page content, and business offerings to prepare for building a new AI-enabled version of the site.
license: MIT
---

# Brand Extractor

## Overview

This skill extracts a complete brand + business profile from an existing website — everything needed to rebuild it as an AI-enabled site. Given a URL, it produces a structured brand guide with visual assets, site architecture, and business content.

**Keywords**: brand extraction, website scraping, brand colors, logo extraction, favicon, typography, site map, navigation, business offerings, content inventory, website rebuild

## When to Use

- User provides a business website URL and wants to extract its branding
- User is preparing to build a new/redesigned version of an existing site
- User needs a brand guide from a live website
- User asks to "analyze", "extract", or "scrape" a website's brand/design

## Extraction Workflow

When the user provides a target URL, follow these steps in order:

### Step 1: Run the Extraction Script

Run the Node.js extraction script to pull structured data from the site:

```
node "<skill_directory>/scripts/extract_brand.mjs" "<target_url>"
```

Note: A Python version (`extract_brand.py`) is also available if Python is installed.

The script outputs JSON to stdout with: colors, fonts, meta tags, favicons, logo candidates, navigation structure, page content, and business offerings.

Save the JSON output to `brand-guide.json` in the project root.

### Step 2: Browser Visual Inspection

Use the browser to visit the target URL and:

1. **Capture a full-page screenshot** — save to `./brand-assets/homepage-screenshot.png`
2. **Verify extracted colors** — compare the script's color palette against what you see
3. **Identify the logo** — look at the header/nav area for the primary logo. Note its exact location, whether it's an SVG, PNG, or text-based
4. **Review the navigation** — verify the extracted nav items match what's visible
5. **Browse key internal pages** (services, about, contact) for additional offerings and content

### Step 3: Download Brand Assets

Download the following assets into a `./brand-assets/` directory:

- **Favicon(s)**: All favicon variants found (`.ico`, `.png`, `.svg`)
- **Logo(s)**: Primary logo and any variants (light/dark, icon-only)
- **OG Image**: The Open Graph social sharing image if present
- **Key imagery**: Hero images or product photos that define the brand's visual style

Use `curl` or the browser to download files. Preserve original filenames where useful.

### Step 4: Crawl Internal Pages

From the extracted navigation links, visit up to **10 key internal pages** using the browser to:

- Capture section headings and page structure
- Identify service/product descriptions and pricing
- Note testimonials, team info, and about content
- Record calls-to-action and conversion points
- Capture any additional brand elements (icons, illustrations, patterns)

### Step 5: Generate the Brand Guide

Create two output files in the project root:

#### `brand-guide.json`
Complete structured data (update with any corrections from visual inspection).

#### `brand-guide.md`
A human-readable brand + business profile with:

1. **Business Overview** — Name, tagline, description, industry
2. **Color Palette** — Primary, secondary, accent, background, text colors with hex codes
3. **Typography** — Heading font, body font, any display/mono fonts
4. **Logos & Favicons** — Embedded previews of downloaded assets
5. **Site Map** — Full navigation tree with page URLs
6. **Business Offerings** — Table of services/products with descriptions and pricing
7. **Page Content Inventory** — Per-page breakdown of sections and key content
8. **Contact & Social** — Phone, email, address, social media links, hours
9. **Design Notes** — Overall aesthetic observations (modern/classic, minimal/rich, light/dark, etc.)

### Step 6: Present for Review

Show the generated `brand-guide.md` to the user for review. Ask if any corrections or additions are needed before proceeding to build the new site.

## Output JSON Schema

```json
{
  "business_name": "string",
  "url": "string",
  "tagline": "string",
  "meta": {
    "title": "string",
    "description": "string",
    "og_image": "string",
    "theme_color": "string"
  },
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "all_colors": ["#hex"]
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name",
    "all_fonts": ["Font Name"]
  },
  "logos": [{ "src": "url", "alt": "string", "type": "svg|png|jpg" }],
  "favicons": [{ "href": "url", "type": "string", "sizes": "string" }],
  "navigation": [
    {
      "label": "string",
      "url": "string",
      "children": [{ "label": "string", "url": "string" }]
    }
  ],
  "pages": {
    "/path": {
      "title": "string",
      "sections": ["Section Name"],
      "headings": ["string"],
      "key_content": "string"
    }
  },
  "offerings": [
    {
      "name": "string",
      "description": "string",
      "price": "string (if found)"
    }
  ],
  "contact": {
    "phone": "string",
    "email": "string",
    "address": "string",
    "social": { "platform": "url" }
  },
  "footer": {
    "links": [{ "label": "string", "url": "string" }],
    "copyright": "string"
  }
}
```

## Tips

- If the extraction script fails (e.g., JavaScript-rendered site), rely on the browser inspection steps to manually gather the data
- For SPAs (React/Vue/Angular sites), the browser steps are essential — the HTML from the script may be incomplete
- When colors are ambiguous, use the browser dev tools to inspect computed styles
- Prioritize the top 5 most-used colors rather than listing every color found
- For fonts, distinguish between Google Fonts (easy to reuse) vs custom/proprietary fonts (may need alternatives)
