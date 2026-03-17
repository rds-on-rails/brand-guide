#!/usr/bin/env node
/**
 * Brand Extractor — Extract brand identity, site structure, and business
 * offerings from any website URL. Zero external dependencies (Node.js stdlib only).
 *
 * Usage:
 *    node extract_brand.mjs <url>
 *
 * Outputs JSON to stdout.
 */

import { get as httpsGet } from "https";
import { get as httpGet } from "http";
import { URL } from "url";

// ──────────────────────────────────────────────
// HTTP Fetch (follows redirects)
// ──────────────────────────────────────────────

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith("https") ? httpsGet : httpGet;
    const req = getter(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BrandExtractor/1.0",
          Accept:
            "text/html,application/xhtml+xml,text/css,*/*;q=0.8",
        },
        timeout: 15000,
      },
      (res) => {
        if (
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          const next = new URL(res.headers.location, url).href;
          fetchUrl(next, maxRedirects - 1).then(resolve).catch(reject);
          return;
        }
        let data = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}

// ──────────────────────────────────────────────
// Regex patterns
// ──────────────────────────────────────────────

const HEX_RE = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const RGB_RE = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
const HSL_RE = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/g;
const FONT_FAMILY_RE = /font-family\s*:\s*([^;}{]+)/g;
const CSS_VAR_RE = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}{]+)/g;
const FONT_FACE_RE = /@font-face\s*\{[^}]*font-family\s*:\s*['"]?([^'";}]+)/g;
const GOOGLE_FONT_RE =
  /fonts\.googleapis\.com\/css2?\?family=([^&"')\s]+)/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

const SOCIAL_DOMAINS = {
  "facebook.com": "facebook",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "instagram.com": "instagram",
  "linkedin.com": "linkedin",
  "youtube.com": "youtube",
  "tiktok.com": "tiktok",
  "github.com": "github",
  "pinterest.com": "pinterest",
};

const GENERIC_FONTS = new Set([
  "inherit",
  "initial",
  "unset",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
]);

// ──────────────────────────────────────────────
// Minimal HTML tag parser
// ──────────────────────────────────────────────

function parseTags(html) {
  const tags = [];
  // Match opening tags, closing tags, and self-closing tags
  const tagRe =
    /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*?)?)(\s*\/?)>/gs;
  let match;
  let lastIndex = 0;

  while ((match = tagRe.exec(html)) !== null) {
    // Capture text between tags
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index);
      if (text.trim()) {
        tags.push({ type: "text", content: text });
      }
    }
    lastIndex = tagRe.lastIndex;

    const isClose = html[match.index + 1] === "/";
    const tagName = match[1].toLowerCase();
    const attrStr = match[2];

    if (isClose) {
      tags.push({ type: "close", tag: tagName });
    } else {
      const attrs = {};
      const attrRe = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
      let am;
      while ((am = attrRe.exec(attrStr)) !== null) {
        attrs[am[1].toLowerCase()] = am[2] ?? am[3] ?? am[4] ?? "";
      }
      // Also match bare attributes (no value)
      const bareRe = /\s([a-zA-Z_][a-zA-Z0-9_-]*)(?=\s|\/?>|$)/g;
      while ((am = bareRe.exec(attrStr)) !== null) {
        if (!(am[1].toLowerCase() in attrs)) {
          attrs[am[1].toLowerCase()] = "";
        }
      }
      tags.push({ type: "open", tag: tagName, attrs, selfClose: !!match[3].trim() });
    }
  }

  // Trailing text
  if (lastIndex < html.length) {
    const text = html.slice(lastIndex);
    if (text.trim()) {
      tags.push({ type: "text", content: text });
    }
  }

  return tags;
}

// ──────────────────────────────────────────────
// Extract structured data from parsed tags
// ──────────────────────────────────────────────

function extractFromHTML(html, baseUrl) {
  const domain = new URL(baseUrl).hostname;

  const resolve = (u) => {
    if (!u) return u;
    try {
      return new URL(u, baseUrl).href;
    } catch {
      return u;
    }
  };

  const isInternal = (u) => {
    if (!u) return false;
    try {
      const parsed = new URL(resolve(u));
      return parsed.hostname === domain;
    } catch {
      return false;
    }
  };

  // Extract <style> blocks
  const styleBlocks = [];
  const styleBlockRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleBlockRe.exec(html)) !== null) {
    styleBlocks.push(sm[1]);
  }

  // Parse tags
  const tokens = parseTags(html);

  // State
  let title = "";
  const meta = {};
  const favicons = [];
  const stylesheets = [];
  const googleFonts = [];
  const navLinks = [];
  const logoCandiates = [];
  const headings = [];
  const sections = [];
  const paragraphs = [];
  const footerLinks = [];
  const footerTexts = [];
  const internalLinks = [];
  const inlineStyles = [];

  // Stack-based context tracking
  const stack = [];
  const inContext = (tag) => stack.some((s) => s.tag === tag);
  let currentTextTag = null;
  let currentText = "";

  for (const token of tokens) {
    if (token.type === "open") {
      const { tag, attrs } = token;
      stack.push({ tag, attrs });

      // <title>
      if (tag === "title") {
        currentTextTag = "title";
        currentText = "";
      }

      // <meta>
      if (tag === "meta") {
        const name = (attrs.name || attrs.property || "").toLowerCase();
        const content = attrs.content || "";
        if (name && content) meta[name] = content;
      }

      // <link> favicon & stylesheets
      if (tag === "link") {
        const rel = (attrs.rel || "").toLowerCase();
        const href = attrs.href || "";
        if (
          rel.includes("icon") ||
          rel.includes("apple-touch-icon") ||
          rel.includes("shortcut")
        ) {
          favicons.push({
            href: resolve(href),
            type: attrs.type || "",
            sizes: attrs.sizes || "",
          });
        }
        if (rel.includes("stylesheet") && href) {
          const resolved = resolve(href);
          stylesheets.push(resolved);
          if (href.includes("fonts.googleapis.com")) {
            googleFonts.push(href);
          }
        }
      }

      // <a> links
      if (tag === "a") {
        const href = attrs.href || "";
        const label = attrs.title || attrs["aria-label"] || "";
        const resolved = resolve(href);

        if (inContext("nav") || inContext("header")) {
          navLinks.push({ url: resolved, label, _needsText: !label });
        }
        if (inContext("footer")) {
          footerLinks.push({ url: resolved, label, _needsText: !label });
        }
        if (href && isInternal(href)) {
          internalLinks.push(resolved);
        }
      }

      // <img> logos
      if (tag === "img") {
        const src = attrs.src || "";
        const alt = attrs.alt || "";
        const cls = attrs.class || "";
        const isLogo = ["logo", "brand", "site-icon"].some((kw) =>
          (src + alt + cls).toLowerCase().includes(kw)
        );
        const inHeader = inContext("header") || inContext("nav");

        if (isLogo || inHeader) {
          const ext = src.split(".").pop()?.split("?")[0] || "unknown";
          logoCandiates.push({
            src: resolve(src),
            alt,
            type: ext,
            isLogoKeyword: isLogo,
            inHeader,
          });
        }
      }

      // SVG in header/nav
      if (tag === "svg" && (inContext("header") || inContext("nav"))) {
        logoCandiates.push({
          src: "[inline-svg]",
          alt: attrs["aria-label"] || "SVG logo",
          type: "svg",
          isLogoKeyword: true,
          inHeader: true,
        });
      }

      // Headings
      if (/^h[1-6]$/.test(tag)) {
        currentTextTag = tag;
        currentText = "";
      }

      // Paragraphs
      if (tag === "p") {
        currentTextTag = "p";
        currentText = "";
      }

      // Sections
      if (tag === "section") {
        sections.push({
          id: attrs.id || "",
          class: attrs.class || "",
          headings: [],
        });
      }

      // Inline styles
      if (attrs.style) {
        inlineStyles.push(attrs.style);
      }
    } else if (token.type === "close") {
      const { tag } = token;

      if (tag === "title" && currentTextTag === "title") {
        title = currentText.trim();
        currentTextTag = null;
      }

      if (/^h[1-6]$/.test(tag) && currentTextTag === tag) {
        const text = currentText.trim();
        if (text) {
          const level = parseInt(tag[1]);
          headings.push({ level, text });
          if (sections.length > 0) {
            sections[sections.length - 1].headings.push(text);
          }
        }
        currentTextTag = null;
      }

      if (tag === "p" && currentTextTag === "p") {
        const text = currentText.trim();
        if (text && text.length > 20) {
          paragraphs.push(text);
        }
        currentTextTag = null;
      }

      // Pop from stack (find the matching open)
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          stack.splice(i, 1);
          break;
        }
      }
    } else if (token.type === "text") {
      const text = token.content
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");

      if (currentTextTag) {
        currentText += text;
      }

      const trimmed = text.trim();
      if (trimmed) {
        // Fill nav link labels
        if (
          (inContext("nav") || inContext("header")) &&
          navLinks.length &&
          navLinks[navLinks.length - 1]._needsText
        ) {
          navLinks[navLinks.length - 1].label = trimmed;
          navLinks[navLinks.length - 1]._needsText = false;
        }

        // Fill footer link labels
        if (
          inContext("footer") &&
          footerLinks.length &&
          footerLinks[footerLinks.length - 1]._needsText
        ) {
          footerLinks[footerLinks.length - 1].label = trimmed;
          footerLinks[footerLinks.length - 1]._needsText = false;
        }

        // Footer text
        if (inContext("footer")) {
          footerTexts.push(trimmed);
        }
      }
    }
  }

  return {
    title,
    meta,
    favicons,
    stylesheets,
    googleFonts,
    navLinks,
    logoCandiates,
    headings,
    sections,
    paragraphs,
    footerLinks,
    footerTexts,
    internalLinks,
    inlineStyles,
    styleBlocks,
  };
}

// ──────────────────────────────────────────────
// CSS Color & Font utilities
// ──────────────────────────────────────────────

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function extractColors(cssText) {
  const colors = [];

  let m;
  const hexRe = new RegExp(HEX_RE.source, "g");
  while ((m = hexRe.exec(cssText)) !== null) {
    let c = m[0].toLowerCase();
    if (c.length === 4)
      c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    colors.push(c);
  }

  const rgbRe = new RegExp(RGB_RE.source, "g");
  while ((m = rgbRe.exec(cssText)) !== null) {
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    colors.push(hex);
  }

  const hslRe = new RegExp(HSL_RE.source, "g");
  while ((m = hslRe.exec(cssText)) !== null) {
    colors.push(hslToHex(+m[1], +m[2], +m[3]));
  }

  return colors;
}

function extractFonts(cssText) {
  const fonts = [];
  let m;

  const ffRe = new RegExp(FONT_FAMILY_RE.source, "g");
  while ((m = ffRe.exec(cssText)) !== null) {
    for (const part of m[1].split(",")) {
      const font = part.trim().replace(/^['"]|['"]$/g, "");
      if (font && !GENERIC_FONTS.has(font.toLowerCase())) {
        fonts.push(font);
      }
    }
  }

  const faceRe = new RegExp(FONT_FACE_RE.source, "gs");
  while ((m = faceRe.exec(cssText)) !== null) {
    const font = m[1].trim().replace(/^['"]|['"]$/g, "");
    if (font) fonts.push(font);
  }

  return fonts;
}

function extractCSSVars(cssText) {
  const vars = {};
  let m;
  const re = new RegExp(CSS_VAR_RE.source, "g");
  while ((m = re.exec(cssText)) !== null) {
    vars[`--${m[1]}`] = m[2].trim();
  }
  return vars;
}

function parseGoogleFonts(urls) {
  const fonts = [];
  for (const url of urls) {
    let m;
    const re = new RegExp(GOOGLE_FONT_RE.source, "g");
    while ((m = re.exec(url)) !== null) {
      for (const family of m[1].split("|")) {
        fonts.push(family.split(":")[0].replace(/\+/g, " "));
      }
    }
  }
  return fonts;
}

// ──────────────────────────────────────────────
// Color ranking
// ──────────────────────────────────────────────

function rankColors(colors) {
  const counter = {};
  for (const c of colors) counter[c] = (counter[c] || 0) + 1;

  const filtered = Object.entries(counter).filter(([color]) => {
    if (color === "#ffffff" || color === "#000000") return false;
    try {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      if (r > 245 && g > 245 && b > 245) return false;
      if (r < 10 && g < 10 && b < 10) return false;
    } catch {
      return false;
    }
    return true;
  });

  return filtered.sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

function assignColorRoles(ranked, cssVars) {
  const roles = {
    primary: "",
    secondary: "",
    accent: "",
    background: "",
    text: "",
  };

  const roleKeywords = {
    primary: ["primary", "brand", "main"],
    secondary: ["secondary"],
    accent: ["accent", "highlight", "cta"],
    background: ["background", "bg", "surface"],
    text: ["text", "foreground", "fg", "body"],
  };

  const hexRe = new RegExp(HEX_RE.source);
  for (const [role, keywords] of Object.entries(roleKeywords)) {
    for (const [varName, varValue] of Object.entries(cssVars)) {
      if (keywords.some((kw) => varName.toLowerCase().includes(kw))) {
        const match = hexRe.exec(varValue);
        if (match) {
          roles[role] = match[0];
          break;
        }
      }
    }
  }

  const remaining = ranked.filter((c) => !Object.values(roles).includes(c));
  for (const role of Object.keys(roles)) {
    if (!roles[role] && remaining.length) {
      roles[role] = remaining.shift();
    }
  }

  return roles;
}

// ──────────────────────────────────────────────
// Contact & business analysis
// ──────────────────────────────────────────────

function extractContact(allText, allLinks) {
  const contact = { phone: "", email: "", address: "", social: {} };

  const emails = allText.match(EMAIL_RE);
  if (emails) contact.email = emails[0];

  const phones = allText.match(PHONE_RE);
  if (phones) {
    const valid = phones.filter(
      (p) => p.replace(/[\s-()]/g, "").length >= 7
    );
    if (valid.length) contact.phone = valid[0];
  }

  for (const link of allLinks) {
    const lower = link.toLowerCase();
    for (const [domain, platform] of Object.entries(SOCIAL_DOMAINS)) {
      if (lower.includes(domain)) {
        contact.social[platform] = link;
        break;
      }
    }
  }

  return contact;
}

function buildNavTree(navLinks) {
  const seen = new Set();
  const clean = [];
  const skipLabels = new Set(["", "menu", "toggle", "close", "open", "skip to content", "skip"]);

  for (const link of navLinks) {
    const label = (link.label || "").trim();
    const url = (link.url || "").trim();
    if (!label || !url) continue;
    if (skipLabels.has(label.toLowerCase())) continue;
    const key = `${label.toLowerCase()}|${url}`;
    if (!seen.has(key)) {
      seen.add(key);
      clean.push({ label, url });
    }
  }
  return clean;
}

// ──────────────────────────────────────────────
// Main extraction
// ──────────────────────────────────────────────

async function extractBrand(url) {
  process.stderr.write(`[info] Fetching ${url}...\n`);
  const html = await fetchUrl(url);
  if (!html) return { error: `Could not fetch ${url}` };

  process.stderr.write(`[info] Parsing HTML (${html.length} bytes)...\n`);
  const parsed = extractFromHTML(html, url);

  // Gather all CSS
  let allCSS = parsed.styleBlocks.join("\n") + "\n" + parsed.inlineStyles.join("\n");

  // Fetch external stylesheets (max 5, skip Google Fonts CSS)
  const sheetsToFetch = parsed.stylesheets
    .filter((s) => !s.includes("fonts.googleapis.com"))
    .slice(0, 5);

  for (const sheetUrl of sheetsToFetch) {
    process.stderr.write(`[info] Fetching stylesheet: ${sheetUrl.slice(0, 80)}...\n`);
    try {
      allCSS += "\n" + (await fetchUrl(sheetUrl));
    } catch {
      /* skip */
    }
  }

  // Colors
  const allColors = extractColors(allCSS);
  const cssVars = extractCSSVars(allCSS);
  const rankedColors = rankColors(allColors);
  const colorRoles = assignColorRoles(rankedColors, cssVars);

  // Fonts
  const cssFonts = extractFonts(allCSS);
  const gfFonts = parseGoogleFonts([
    ...parsed.googleFonts,
    ...parsed.stylesheets,
  ]);
  const allFonts = [...new Set([...gfFonts, ...cssFonts])];
  const fontRoles = {
    heading: allFonts[0] || "",
    body: allFonts[1] || allFonts[0] || "",
    all_fonts: allFonts,
  };

  // Navigation
  const nav = buildNavTree(parsed.navLinks);

  // Business name
  let businessName = parsed.meta["application-name"] || "";
  if (!businessName) businessName = parsed.meta["og:site_name"] || "";
  if (!businessName && parsed.title) {
    businessName = parsed.title.split(/\s*[|\-–—]\s*/)[0].trim();
  }

  // Hero / tagline
  const h1s = parsed.headings
    .filter((h) => h.level === 1)
    .map((h) => h.text);
  const heroText = h1s[0] || "";
  const tagline = parsed.meta.description || heroText || "";

  // Contact
  const allText =
    parsed.paragraphs.join(" ") + " " + parsed.footerTexts.join(" ");
  const allLinks = [
    ...parsed.internalLinks,
    ...parsed.footerLinks.map((l) => l.url),
  ];
  const contact = extractContact(allText + " " + allLinks.join(" "), allLinks);

  // Offerings from headings
  const offerings = parsed.headings
    .filter((h) => h.level <= 3)
    .map((h) => ({ name: h.text, description: "" }))
    .slice(0, 20);

  // Pages from nav
  const pages = {};
  for (const link of nav) {
    try {
      const path = new URL(link.url).pathname || "/";
      pages[path] = {
        title: link.label,
        sections: [],
        headings: [],
        key_content: "",
      };
    } catch {
      /* skip invalid urls */
    }
  }

  // Homepage content
  const homeSections = parsed.sections
    .filter((s) => s.id || s.headings.length)
    .map(
      (s, i) =>
        s.id || s.headings.slice(0, 2).join(", ") || `section-${i}`
    );

  if (!pages["/"]) {
    pages["/"] = { title: "Home", sections: [], headings: [], key_content: "" };
  }
  pages["/"].sections = homeSections;
  pages["/"].headings = parsed.headings.map((h) => h.text);
  pages["/"].key_content = heroText;

  // Footer
  let footerCopyright = "";
  for (const text of parsed.footerTexts) {
    if (text.includes("©") || text.toLowerCase().includes("copyright")) {
      footerCopyright = text;
      break;
    }
  }
  const footerClean = buildNavTree(parsed.footerLinks);

  // Logos — rank by relevance
  const logos = parsed.logoCandiates
    .sort(
      (a, b) =>
        (b.isLogoKeyword ? 1 : 0) +
        (b.inHeader ? 1 : 0) -
        ((a.isLogoKeyword ? 1 : 0) + (a.inHeader ? 1 : 0))
    )
    .filter(
      ((seen) => (l) => {
        if (seen.has(l.src)) return false;
        seen.add(l.src);
        return true;
      })(new Set())
    )
    .slice(0, 5)
    .map((l) => ({ src: l.src, alt: l.alt || "", type: l.type }));

  return {
    business_name: businessName,
    url,
    tagline: tagline.slice(0, 300),
    meta: {
      title: parsed.title,
      description: parsed.meta.description || "",
      og_image: parsed.meta["og:image"] || "",
      theme_color: parsed.meta["theme-color"] || "",
    },
    colors: {
      ...colorRoles,
      all_colors: rankedColors.slice(0, 20),
    },
    fonts: fontRoles,
    logos,
    favicons: parsed.favicons,
    navigation: nav,
    pages,
    offerings,
    contact,
    footer: {
      links: footerClean.slice(0, 15),
      copyright: footerCopyright,
    },
  };
}

// ──────────────────────────────────────────────
// CLI entry point
// ──────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length < 1) {
  process.stderr.write(
    "Usage: node extract_brand.mjs <url>\nExample: node extract_brand.mjs https://example.com\n"
  );
  process.exit(1);
}

let target = args[0];
if (!target.startsWith("http")) target = "https://" + target;

extractBrand(target)
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    process.stderr.write(`[error] ${err.message}\n`);
    process.exit(1);
  });
