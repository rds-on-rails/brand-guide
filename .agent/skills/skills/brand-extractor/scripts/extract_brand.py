#!/usr/bin/env python3
"""
Brand Extractor — Extract brand identity, site structure, and business
offerings from any website URL. Zero external dependencies (stdlib only).

Usage:
    python extract_brand.py <url>

Outputs JSON to stdout.
"""

import sys
import json
import re
from urllib.request import urlopen, Request
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
from collections import Counter


# ──────────────────────────────────────────────
# HTML Parser
# ──────────────────────────────────────────────

class BrandHTMLParser(HTMLParser):
    """Single-pass HTML parser that extracts brand-relevant data."""

    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.domain = urlparse(base_url).netloc

        # Meta & head
        self.title = ""
        self.meta = {}
        self.favicons = []
        self.stylesheets = []
        self.google_fonts = []

        # Navigation
        self.nav_links = []
        self._in_nav = False
        self._in_header = False
        self._nav_depth = 0
        self._header_depth = 0

        # Logos
        self.logo_candidates = []

        # Content
        self.headings = []
        self.sections = []
        self.paragraphs = []
        self._current_tag = None
        self._current_text = ""
        self._tag_stack = []

        # Footer
        self.footer_links = []
        self.footer_text = []
        self._in_footer = False
        self._footer_depth = 0

        # All internal links
        self.internal_links = []

        # Inline styles (for color extraction)
        self.inline_styles = []
        self.style_blocks = []
        self._in_style = False
        self._style_text = ""

        # Title tracking
        self._in_title = False
        self._title_text = ""

    def _resolve(self, url):
        if not url:
            return url
        return urljoin(self.base_url, url)

    def _is_internal(self, url):
        if not url:
            return False
        parsed = urlparse(self._resolve(url))
        return parsed.netloc == self.domain or parsed.netloc == ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self._tag_stack.append(tag)

        # -- <title> --
        if tag == "title":
            self._in_title = True
            self._title_text = ""

        # -- <meta> --
        if tag == "meta":
            name = attrs_dict.get("name", attrs_dict.get("property", "")).lower()
            content = attrs_dict.get("content", "")
            if name and content:
                self.meta[name] = content

        # -- <link> favicons --
        if tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            if any(r in rel for r in ["icon", "apple-touch-icon", "shortcut"]):
                self.favicons.append({
                    "href": self._resolve(href),
                    "type": attrs_dict.get("type", ""),
                    "sizes": attrs_dict.get("sizes", ""),
                })
            # Stylesheets
            if "stylesheet" in rel and href:
                resolved = self._resolve(href)
                self.stylesheets.append(resolved)
                if "fonts.googleapis.com" in href:
                    self.google_fonts.append(href)

        # -- <nav> --
        if tag == "nav":
            self._in_nav = True
            self._nav_depth = 1

        elif self._in_nav:
            self._nav_depth += 1

        # -- <header> --
        if tag == "header":
            self._in_header = True
            self._header_depth = 1
        elif self._in_header:
            self._header_depth += 1

        # -- <footer> --
        if tag == "footer":
            self._in_footer = True
            self._footer_depth = 1
        elif self._in_footer:
            self._footer_depth += 1

        # -- <a> links --
        if tag == "a":
            href = attrs_dict.get("href", "")
            text_hint = attrs_dict.get("title", attrs_dict.get("aria-label", ""))
            resolved = self._resolve(href)

            if self._in_nav or self._in_header:
                self.nav_links.append({"url": resolved, "label": text_hint, "_tag": "a"})

            if self._in_footer:
                self.footer_links.append({"url": resolved, "label": text_hint})

            if href and self._is_internal(href):
                self.internal_links.append(resolved)

        # -- <img> logos --
        if tag == "img":
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            cls = attrs_dict.get("class", "")
            is_logo = any(kw in (src + alt + cls).lower() for kw in ["logo", "brand", "site-icon"])
            is_in_header = self._in_header or self._in_nav

            if is_logo or is_in_header:
                self.logo_candidates.append({
                    "src": self._resolve(src),
                    "alt": alt,
                    "type": src.rsplit(".", 1)[-1].split("?")[0] if "." in src else "unknown",
                    "is_logo_keyword": is_logo,
                    "in_header": is_in_header,
                })

        # -- SVG logos in header/nav --
        if tag == "svg" and (self._in_header or self._in_nav):
            self.logo_candidates.append({
                "src": "[inline-svg]",
                "alt": attrs_dict.get("aria-label", "SVG logo"),
                "type": "svg",
                "is_logo_keyword": True,
                "in_header": True,
            })

        # -- Headings --
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._current_tag = tag
            self._current_text = ""

        # -- Sections --
        if tag == "section":
            section_id = attrs_dict.get("id", "")
            section_class = attrs_dict.get("class", "")
            self.sections.append({
                "id": section_id,
                "class": section_class,
                "headings": [],
            })

        # -- Paragraphs --
        if tag == "p":
            self._current_tag = "p"
            self._current_text = ""

        # -- <style> blocks --
        if tag == "style":
            self._in_style = True
            self._style_text = ""

        # -- Inline styles --
        style = attrs_dict.get("style", "")
        if style:
            self.inline_styles.append(style)

    def handle_endtag(self, tag):
        if self._tag_stack and self._tag_stack[-1] == tag:
            self._tag_stack.pop()

        if tag == "title":
            self._in_title = False
            self.title = self._title_text.strip()

        if tag == "nav" and self._in_nav:
            self._nav_depth -= 1
            if self._nav_depth <= 0:
                self._in_nav = False

        if self._in_nav and tag != "nav":
            self._nav_depth -= 1

        if tag == "header" and self._in_header:
            self._header_depth -= 1
            if self._header_depth <= 0:
                self._in_header = False
        elif self._in_header:
            self._header_depth -= 1

        if tag == "footer" and self._in_footer:
            self._footer_depth -= 1
            if self._footer_depth <= 0:
                self._in_footer = False
        elif self._in_footer:
            self._footer_depth -= 1

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self._current_tag == tag:
            text = self._current_text.strip()
            if text:
                self.headings.append({"level": int(tag[1]), "text": text})
                if self.sections:
                    self.sections[-1]["headings"].append(text)
            self._current_tag = None

        if tag == "p" and self._current_tag == "p":
            text = self._current_text.strip()
            if text and len(text) > 20:
                self.paragraphs.append(text)
            self._current_tag = None

        if tag == "style" and self._in_style:
            self._in_style = False
            self.style_blocks.append(self._style_text)

    def handle_data(self, data):
        if self._in_title:
            self._title_text += data

        if self._in_style:
            self._style_text += data

        if self._current_tag:
            self._current_text += data

        if self._in_footer:
            text = data.strip()
            if text:
                self.footer_text.append(text)

        # Fill in nav link labels from text content
        if (self._in_nav or self._in_header) and data.strip():
            if self.nav_links and not self.nav_links[-1]["label"]:
                self.nav_links[-1]["label"] = data.strip()


# ──────────────────────────────────────────────
# CSS Color & Font Extraction
# ──────────────────────────────────────────────

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{3,4}){1,2}\b")
RGB_RE = re.compile(r"rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})")
HSL_RE = re.compile(r"hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?")
FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;}{]+)")
CSS_VAR_RE = re.compile(r"--([a-zA-Z0-9_-]+)\s*:\s*([^;}{]+)")
FONT_FACE_RE = re.compile(r"@font-face\s*\{[^}]*font-family\s*:\s*['\"]?([^'\";}]+)", re.DOTALL)
GOOGLE_FONT_RE = re.compile(r"fonts\.googleapis\.com/css2?\?family=([^&\"')\s]+)")


def hsl_to_hex(h, s, l):
    """Convert HSL to hex."""
    s, l = s / 100, l / 100
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60: r, g, b = c, x, 0
    elif h < 120: r, g, b = x, c, 0
    elif h < 180: r, g, b = 0, c, x
    elif h < 240: r, g, b = 0, x, c
    elif h < 300: r, g, b = x, 0, c
    else: r, g, b = c, 0, x
    return "#{:02x}{:02x}{:02x}".format(int((r+m)*255), int((g+m)*255), int((b+m)*255))


def extract_colors_from_css(css_text):
    """Extract all color values from CSS text."""
    colors = []

    for match in HEX_RE.findall(css_text):
        normalized = match.lower()
        if len(normalized) == 4:
            normalized = "#" + normalized[1]*2 + normalized[2]*2 + normalized[3]*2
        colors.append(normalized)

    for match in RGB_RE.findall(css_text):
        r, g, b = int(match[0]), int(match[1]), int(match[2])
        colors.append("#{:02x}{:02x}{:02x}".format(r, g, b))

    for match in HSL_RE.findall(css_text):
        colors.append(hsl_to_hex(int(match[0]), int(match[1]), int(match[2])))

    return colors


def extract_fonts_from_css(css_text):
    """Extract font families from CSS text."""
    fonts = []
    for match in FONT_FAMILY_RE.findall(css_text):
        for font in match.split(","):
            font = font.strip().strip("'\"")
            if font and font.lower() not in (
                "inherit", "initial", "unset", "sans-serif", "serif",
                "monospace", "cursive", "fantasy", "system-ui",
                "-apple-system", "blinkmacsystemfont"
            ):
                fonts.append(font)

    for match in FONT_FACE_RE.findall(css_text):
        font = match.strip().strip("'\"")
        if font:
            fonts.append(font)

    return fonts


def extract_css_variables(css_text):
    """Extract CSS custom properties."""
    variables = {}
    for match in CSS_VAR_RE.findall(css_text):
        variables[f"--{match[0]}"] = match[1].strip()
    return variables


def extract_google_fonts(urls):
    """Parse Google Fonts family names from URLs."""
    fonts = []
    for url in urls:
        for match in GOOGLE_FONT_RE.findall(url):
            for family in match.split("|"):
                name = family.split(":")[0].replace("+", " ")
                fonts.append(name)
    return fonts


# ──────────────────────────────────────────────
# Fetch external stylesheets
# ──────────────────────────────────────────────

def fetch_url(url, timeout=10):
    """Fetch a URL and return its text content."""
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 BrandExtractor/1.0"})
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"[warn] Could not fetch {url}: {e}", file=sys.stderr)
        return ""


def fetch_stylesheets(stylesheet_urls, max_sheets=5):
    """Fetch external CSS and return combined text."""
    css_combined = ""
    for url in stylesheet_urls[:max_sheets]:
        if "fonts.googleapis.com" in url:
            continue  # Skip font CSS, we parse those separately
        css_combined += fetch_url(url) + "\n"
    return css_combined


# ──────────────────────────────────────────────
# Business content analysis
# ──────────────────────────────────────────────

OFFERING_KEYWORDS = [
    "service", "product", "solution", "offering", "plan", "pricing",
    "package", "feature", "benefit", "what we do", "our work",
    "portfolio", "capabilities", "expertise",
]

CONTACT_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
CONTACT_PHONE_RE = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")

SOCIAL_PLATFORMS = {
    "facebook.com": "facebook",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "instagram.com": "instagram",
    "linkedin.com": "linkedin",
    "youtube.com": "youtube",
    "tiktok.com": "tiktok",
    "github.com": "github",
    "pinterest.com": "pinterest",
}


def extract_contact_info(all_text, all_links):
    """Extract contact details from page text and links."""
    contact = {"phone": "", "email": "", "address": "", "social": {}}

    # Email
    emails = CONTACT_EMAIL_RE.findall(all_text)
    if emails:
        contact["email"] = emails[0]

    # Phone
    phones = CONTACT_PHONE_RE.findall(all_text)
    if phones:
        # Filter out numbers that are too short or look like dates
        valid = [p for p in phones if len(p.replace(" ", "").replace("-", "")) >= 7]
        if valid:
            contact["phone"] = valid[0]

    # Social links
    for link in all_links:
        url = link.lower()
        for domain, platform in SOCIAL_PLATFORMS.items():
            if domain in url:
                contact["social"][platform] = link
                break

    return contact


def identify_offerings(headings, paragraphs):
    """Identify business offerings from headings and content."""
    offerings = []
    for h in headings:
        text_lower = h["text"].lower()
        if any(kw in text_lower for kw in OFFERING_KEYWORDS):
            offerings.append({
                "name": h["text"],
                "description": "",
                "source": f"h{h['level']} heading",
            })
        elif h["level"] <= 3:
            # Potential service/product name if it's a subheading
            offerings.append({
                "name": h["text"],
                "description": "",
                "source": f"h{h['level']} heading",
            })
    return offerings


# ──────────────────────────────────────────────
# Color ranking
# ──────────────────────────────────────────────

def rank_colors(colors):
    """Rank colors by frequency and remove near-black/white noise."""
    counter = Counter(colors)

    # Filter out near-white and near-black
    filtered = {}
    for color, count in counter.items():
        if color in ("#ffffff", "#000000", "#fff", "#000"):
            continue
        try:
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            # Skip very close to white or black
            if (r > 245 and g > 245 and b > 245) or (r < 10 and g < 10 and b < 10):
                continue
            filtered[color] = count
        except (ValueError, IndexError):
            continue

    ranked = sorted(filtered.items(), key=lambda x: -x[1])
    return [c[0] for c in ranked]


def assign_color_roles(ranked_colors, css_vars):
    """Try to assign primary/secondary/accent/background/text from CSS vars or frequency."""
    roles = {
        "primary": "",
        "secondary": "",
        "accent": "",
        "background": "",
        "text": "",
    }

    # First try CSS variables
    var_role_map = {
        "primary": ["primary", "brand", "main"],
        "secondary": ["secondary"],
        "accent": ["accent", "highlight", "cta"],
        "background": ["background", "bg", "surface"],
        "text": ["text", "foreground", "fg", "body"],
    }

    for role, keywords in var_role_map.items():
        for var_name, var_value in css_vars.items():
            if any(kw in var_name.lower() for kw in keywords):
                hex_match = HEX_RE.search(var_value)
                if hex_match:
                    roles[role] = hex_match.group()
                    break

    # Fill remaining from ranked colors
    remaining = [c for c in ranked_colors if c not in roles.values()]
    for role in roles:
        if not roles[role] and remaining:
            roles[role] = remaining.pop(0)

    return roles


# ──────────────────────────────────────────────
# Build navigation tree
# ──────────────────────────────────────────────

def build_nav_tree(nav_links):
    """Clean and deduplicate navigation links."""
    seen = set()
    clean = []
    for link in nav_links:
        label = link.get("label", "").strip()
        url = link.get("url", "").strip()
        if not label or not url:
            continue
        if label.lower() in ("", "menu", "toggle", "close", "open"):
            continue
        key = (label.lower(), url)
        if key not in seen:
            seen.add(key)
            clean.append({"label": label, "url": url})
    return clean


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def extract_brand(url):
    """Main extraction function."""
    # Fetch the page
    html = fetch_url(url)
    if not html:
        return {"error": f"Could not fetch {url}"}

    # Parse HTML
    parser = BrandHTMLParser(url)
    try:
        parser.feed(html)
    except Exception as e:
        print(f"[warn] HTML parsing error: {e}", file=sys.stderr)

    # Gather all CSS text (inline + style blocks + external sheets)
    all_css = "\n".join(parser.style_blocks)
    all_css += "\n" + "\n".join(parser.inline_styles)
    all_css += "\n" + fetch_stylesheets(parser.stylesheets)

    # Extract colors
    all_colors = extract_colors_from_css(all_css)
    css_vars = extract_css_variables(all_css)
    ranked = rank_colors(all_colors)
    color_roles = assign_color_roles(ranked, css_vars)

    # Extract fonts
    css_fonts = extract_fonts_from_css(all_css)
    gf_fonts = extract_google_fonts(parser.google_fonts + parser.stylesheets)
    all_fonts = list(dict.fromkeys(gf_fonts + css_fonts))  # dedupe, preserve order

    font_roles = {"heading": "", "body": "", "all_fonts": all_fonts}
    if len(all_fonts) >= 2:
        font_roles["heading"] = all_fonts[0]
        font_roles["body"] = all_fonts[1]
    elif len(all_fonts) == 1:
        font_roles["heading"] = all_fonts[0]
        font_roles["body"] = all_fonts[0]

    # Navigation
    nav = build_nav_tree(parser.nav_links)

    # Business name
    business_name = parser.meta.get("application-name", "")
    if not business_name:
        business_name = parser.meta.get("og:site_name", "")
    if not business_name and parser.title:
        # Use title, strip common suffixes
        business_name = re.split(r"\s*[|\-–—]\s*", parser.title)[0].strip()

    # Tagline
    tagline = parser.meta.get("description", "")
    h1s = [h["text"] for h in parser.headings if h["level"] == 1]
    hero_text = h1s[0] if h1s else ""

    # Contact
    all_text = " ".join(parser.paragraphs + parser.footer_text)
    all_links = parser.internal_links + [l["url"] for l in parser.footer_links]
    contact = extract_contact_info(all_text + " " + " ".join(all_links), all_links)

    # Offerings
    offerings = identify_offerings(parser.headings, parser.paragraphs)

    # Pages (from nav)
    pages = {}
    for link in nav:
        path = urlparse(link["url"]).path or "/"
        pages[path] = {
            "title": link["label"],
            "sections": [],
            "headings": [],
            "key_content": "",
        }

    # Homepage content
    homepage_sections = [s["id"] or ", ".join(s["headings"][:2]) or f"section-{i}"
                         for i, s in enumerate(parser.sections) if s["id"] or s["headings"]]
    if "/" not in pages:
        pages["/"] = {"title": "Home", "sections": [], "headings": [], "key_content": ""}
    pages["/"]["sections"] = homepage_sections
    pages["/"]["headings"] = [h["text"] for h in parser.headings]
    pages["/"]["key_content"] = hero_text

    # Footer
    footer_copyright = ""
    for text in parser.footer_text:
        if "©" in text or "copyright" in text.lower():
            footer_copyright = text
            break

    footer_clean = build_nav_tree(
        [{"label": l.get("label", ""), "url": l.get("url", "")} for l in parser.footer_links]
    )

    # Logo ranking — prefer items with logo keyword + in header
    logos = sorted(
        parser.logo_candidates,
        key=lambda x: (x.get("is_logo_keyword", False), x.get("in_header", False)),
        reverse=True,
    )
    # Dedupe by src
    seen_srcs = set()
    unique_logos = []
    for logo in logos:
        if logo["src"] not in seen_srcs:
            seen_srcs.add(logo["src"])
            unique_logos.append({
                "src": logo["src"],
                "alt": logo.get("alt", ""),
                "type": logo.get("type", "unknown"),
            })

    # Build result
    result = {
        "business_name": business_name,
        "url": url,
        "tagline": tagline[:200] if tagline else hero_text[:200] if hero_text else "",
        "meta": {
            "title": parser.title,
            "description": parser.meta.get("description", ""),
            "og_image": parser.meta.get("og:image", ""),
            "theme_color": parser.meta.get("theme-color", ""),
        },
        "colors": {
            **color_roles,
            "all_colors": ranked[:20],
        },
        "fonts": font_roles,
        "logos": unique_logos[:5],
        "favicons": parser.favicons,
        "navigation": nav,
        "pages": pages,
        "offerings": [{"name": o["name"], "description": o["description"]} for o in offerings[:20]],
        "contact": contact,
        "footer": {
            "links": footer_clean[:15],
            "copyright": footer_copyright,
        },
    }

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_brand.py <url>", file=sys.stderr)
        print("Example: python extract_brand.py https://example.com", file=sys.stderr)
        sys.exit(1)

    target = sys.argv[1]
    if not target.startswith("http"):
        target = "https://" + target

    data = extract_brand(target)
    print(json.dumps(data, indent=2, ensure_ascii=False))
