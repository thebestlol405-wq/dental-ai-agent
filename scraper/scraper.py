"""
scraper.py — Local business discovery via Playwright-powered web searches.

Accepts a target city and industry (e.g. 'Toronto', 'MedSpa') and returns
a list of business names, websites, and publicly listed contact emails.
"""

import re
import time
import random
from typing import Optional

from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout


EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PREFERRED_PREFIXES = ("info@", "hello@", "contact@", "team@", "support@", "hi@", "hey@")


class LocalBusinessScraper:
    """Scrapes local business leads from Google search results."""

    def __init__(self, headless: bool = True, slow_mo: int = 200):
        self.headless = headless
        self.slow_mo = slow_mo
        self._playwright = None
        self._browser = None
        self._page = None

    # ── Lifecycle ───────────────────────────────────────────

    def start(self):
        self._playwright = sync_playwright().start()
        self._browser = self._playwright.chromium.launch(
            headless=self.headless,
            slow_mo=self.slow_mo,
        )
        self._page = self._browser.new_page()
        self._page.set_viewport_size({"width": 1280, "height": 900})

    def stop(self):
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()

    # ── Core search ─────────────────────────────────────────

    def _search_google(self, query: str):
        """Navigate to Google and submit a search query."""
        # Go directly to the search results page (bypasses homepage)
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}&hl=en"
        self._page.goto(search_url, timeout=20000)
        self._page.wait_for_load_state("domcontentloaded", timeout=15000)

        # Accept cookies / consent banners
        for attempt in range(3):
            for btn_text in ("Accept all", "Accept", "I agree", "Got it", "Accept all & continue"):
                try:
                    btn = self._page.locator(f"button:has-text('{btn_text}'), div[role='button']:has-text('{btn_text}')")
                    if btn.count() > 0:
                        btn.first.click(timeout=2000)
                        time.sleep(1)
                        break
                except Exception:
                    continue
            # Check if the consent overlay is gone
            try:
                self._page.wait_for_load_state("networkidle", timeout=5000)
                break
            except Exception:
                continue

        time.sleep(1.5)

    # ── Result extraction ───────────────────────────────────

    def _extract_search_results(self) -> list[dict]:
        """
        Parse organic Google search results using multiple robust selectors.
        Google frequently changes class names, so we try several approaches.
        """
        results = []
        seen_urls = set()

        # ── Approach 1: Extract from all <a> tags that have an <h3> child ──
        # This is the most reliable selector because Google always wraps
        # result titles in <h3> inside clickable <a> links.
        for h3 in self._page.locator("a h3").all():
            try:
                link = h3.locator("xpath=..")  # parent <a> element
                href = link.get_attribute("href") or ""
                name = h3.inner_text().strip()

                if not name or not href:
                    continue
                if href.startswith("/"):
                    continue
                if any(d in href for d in ("google.com/search", "youtube.com", "blogspot.com", "facebook.com", "instagram.com", "twitter.com", "linkedin.com")):
                    continue
                if href in seen_urls:
                    continue

                # Clean the URL
                clean_url = href.split("?")[0].rstrip("/") if "http" in href else href

                seen_urls.add(href)
                results.append({
                    "business_name": name,
                    "website": clean_url,
                    "snippet": "",
                })
            except Exception:
                continue

        # ── Approach 2: If Approach 1 found nothing, try the classic ──
        if not results:
            possible_containers = [
                "div.g",
                "div[data-hveid]",
                "div[data-snc]",
                "div.MjjYud",
                "div.yuRUbf",
            ]
            for selector in possible_containers:
                items = self._page.locator(selector).all()
                if items:
                    for item in items[:30]:
                        try:
                            link_el = item.locator("a[href^='http']").first
                            href = link_el.get_attribute("href")
                            if not href or href in seen_urls:
                                continue
                            if any(d in href for d in ("google.com", "youtube.com", "blogspot.com")):
                                continue

                            h3 = item.locator("h3").first
                            name = h3.inner_text().strip() if h3.count() else ""

                            if name:
                                seen_urls.add(href)
                                clean_url = href.split("?")[0].rstrip("/")
                                results.append({
                                    "business_name": name,
                                    "website": clean_url,
                                    "snippet": "",
                                })
                        except Exception:
                            continue
                    if results:
                        break  # Found results with this selector

        return results

    # ── Google Maps extraction (fallback) ───────────────────

    def _search_google_maps(self, city: str, industry: str, max_results: int = 10) -> list[dict]:
        """Search Google Maps for local businesses."""
        query = f"{industry} in {city}"
        maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}/"
        leads = []

        try:
            self._page.goto(maps_url, timeout=20000)
            self._page.wait_for_load_state("networkidle", timeout=15000)
            time.sleep(3)

            # Try to scroll to load more results
            for _ in range(3):
                self._page.evaluate("window.scrollBy(0, 300)")
                time.sleep(1.5)

            # Extract business cards
            cards = self._page.locator("div.Nv2PK, div[role='article']").all()
            for card in cards[:max_results]:
                try:
                    name_el = card.locator("div.qBF1Pd, div.fontHeadlineSmall, h3").first
                    name = name_el.inner_text().strip() if name_el.count() else ""

                    website_btn = card.locator("a[data-value='Website'], a[aria-label*='website']").first
                    website = website_btn.get_attribute("href") or "" if website_btn.count() else ""

                    if name:
                        leads.append({
                            "business_name": name,
                            "website": website,
                            "email": "",
                        })
                except Exception:
                    continue
        except Exception as e:
            print(f"[scraper] Google Maps search failed: {e}")

        return leads

    # ── Email scraping from a website ───────────────────────

    def _scrape_emails_from_page(self, url: str, max_depth: int = 2) -> list[str]:
        """
        Visit a business website and look for email addresses.
        Checks the homepage and up to (max_depth - 1) internal links
        (contact, about, team pages).
        """
        found_emails = set()
        visited = set()

        pages_to_check = [url]
        for _ in range(max_depth):
            if not pages_to_check:
                break
            page_url = pages_to_check.pop(0)
            if page_url in visited:
                continue
            visited.add(page_url)

            try:
                self._page.goto(page_url, timeout=15000, wait_until="domcontentloaded")
                time.sleep(1.5)
                body_text = self._page.locator("body").inner_text(timeout=5000)

                # Find all emails
                raw_emails = EMAIL_PATTERN.findall(body_text)
                for e in raw_emails:
                    e_lower = e.lower().strip()
                    # Filter common disposable / fake patterns
                    if any(skip in e_lower for skip in ("example.com", "domain.com", "yoursite.com", "@gmail.com", "@yahoo.com", "@hotmail.com")):
                        # Accept gmail/yahoo for small businesses without custom domains
                        pass
                    found_emails.add(e_lower)

                # Discover contact/about/team links for deeper crawling
                if len(visited) < max_depth:
                    for link in self._page.locator("a[href]").all():
                        try:
                            href = link.get_attribute("href") or ""
                            text = link.inner_text().lower().strip()
                        except Exception:
                            continue
                        if any(kw in text or kw in href for kw in ("contact", "about", "team", "support")):
                            full_url = self._normalize_url(href, url)
                            if full_url and full_url not in visited:
                                pages_to_check.append(full_url)

            except Exception:
                continue

        return list(found_emails)

    @staticmethod
    def _normalize_url(href: str, base: str) -> Optional[str]:
        """Turn a relative URL into absolute using the base URL."""
        if href.startswith("http"):
            return href.rstrip("/")
        if href.startswith("/"):
            from urllib.parse import urlparse
            parsed = urlparse(base)
            return f"{parsed.scheme}://{parsed.netloc}{href.rstrip('/')}"
        return None

    @staticmethod
    def _rank_emails(emails: list[str]) -> list[str]:
        """Return emails sorted so preferred prefixes (info@, hello@) come first."""
        def _sort_key(e):
            prefix = e.split("@")[0] + "@"
            return (0 if prefix in PREFERRED_PREFIXES else 1, e)
        return sorted(emails, key=_sort_key)

    # ── Public API ──────────────────────────────────────────

    def search_businesses(self, city: str, industry: str, max_results: int = 20) -> list[dict]:
        """
        Find local businesses by city and industry.
        Returns a list of dicts with keys: business_name, website, email, industry, location.

        Strategy:
        1. Try Google web search for organic business listings
        2. If that yields 0 results, fall back to Google Maps
        """
        leads = []

        # ── Strategy 1: Google web search ──────────────────────
        query = f"best {industry} in {city}"
        print(f"[scraper] Strategy 1 — Web search: \"{query}\"")
        self._search_google(query)
        search_results = self._extract_search_results()
        print(f"[scraper] Web search found {len(search_results)} raw results")

        leads = self._process_search_results(
            search_results, city, industry, max_results
        )

        # ── Strategy 2: Google Maps fallback ───────────────────
        if not leads:
            print(f"[scraper] Strategy 2 — Google Maps: \"{industry} in {city}\"")
            maps_leads = self._search_google_maps(city, industry, max_results)
            print(f"[scraper] Maps search found {len(maps_leads)} businesses")

            for ml in maps_leads[:max_results]:
                business_name = ml["business_name"]
                website = ml["website"]
                print(f"[scraper]  Maps result: {business_name} — {website or '(no website)'}")

                if website:
                    emails = self._scrape_emails_from_page(website, max_depth=2)
                    ranked = self._rank_emails(emails)
                    chosen_email = ranked[0] if ranked else ""
                else:
                    chosen_email = ""

                if not chosen_email:
                    # Try fallback email search
                    chosen_email = self._fallback_search_email(business_name, city)

                if chosen_email:
                    leads.append({
                        "business_name": business_name,
                        "industry": industry,
                        "location": city,
                        "email": chosen_email,
                        "website": website,
                    })

                delay = random.uniform(2.0, 5.0)
                time.sleep(delay)

        print(f"[scraper] Done — {len(leads)} leads with emails collected")
        return leads

    def _process_search_results(self, search_results: list[dict], city: str,
                                  industry: str, max_results: int) -> list[dict]:
        """Extract emails from web search results and build lead objects."""
        leads = []
        for i, result in enumerate(search_results[:max_results]):
            business_name = result["business_name"]
            website = result["website"]
            print(f"[scraper]  [{i+1}/{min(len(search_results), max_results)}] {business_name} — {website}")

            # Try to extract emails from the website
            emails = self._scrape_emails_from_page(website, max_depth=2)
            ranked = self._rank_emails(emails)

            if ranked:
                chosen_email = ranked[0]
                print(f"[scraper]    → Email found: {chosen_email}")
            else:
                chosen_email = self._fallback_search_email(business_name, city)
                if chosen_email:
                    print(f"[scraper]    → Email (fallback): {chosen_email}")
                else:
                    print(f"[scraper]    → No email found, skipping")
                    continue

            leads.append({
                "business_name": business_name,
                "industry": industry,
                "location": city,
                "email": chosen_email,
                "website": website,
            })

            delay = random.uniform(2.0, 5.0)
            time.sleep(delay)

        return leads

    def _fallback_search_email(self, business_name: str, city: str) -> Optional[str]:
        """Secondary search specifically for the business email."""
        query = f"{business_name} {city} email contact"
        self._search_google(query)

        # Scan the snippet area and visible text on the SERP
        page_text = self._page.locator("body").inner_text(timeout=5000)
        emails = EMAIL_PATTERN.findall(page_text)
        ranked = self._rank_emails([e.lower() for e in emails])
        return ranked[0] if ranked else None


# Convenience function for quick use
def scrape(city: str, industry: str, max_results: int = 20) -> list[dict]:
    """One-shot: start browser, scrape, stop, return leads."""
    with LocalBusinessScraper() as scraper:
        return scraper.search_businesses(city, industry, max_results)
