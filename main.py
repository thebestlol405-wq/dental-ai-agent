#!/usr/bin/env python3
"""
main.py — Double Agent automated outreach pipeline.

Usage:
    python main.py --city "Toronto" --industry "MedSpa"
    python main.py --city "Vancouver" --industry "Dentist" --max-leads 15

Workflow:
    1. Scrape → finds local businesses & their contact emails
    2. Store  → saves leads to SQLite (deduplicated)
    3. Send   → emails leads with randomised delays & daily cap
"""

import argparse
import sys
import os

# Ensure project root is on the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import LeadDatabase, LeadStatus
from scraper import LocalBusinessScraper
from sender import send_pending_leads

from dotenv import load_dotenv
load_dotenv()


def parse_args():
    parser = argparse.ArgumentParser(
        description="Double Agent — local business scraping + cold email automation",
    )
    parser.add_argument("--city", default=None, help="Target city (e.g., 'Toronto')")
    parser.add_argument("--industry", default=None, help="Target industry (e.g., 'MedSpa')")
    parser.add_argument("--max-leads", type=int, default=20,
                        help="Max leads to scrape per run (default: 20)")
    parser.add_argument("--scrape-only", action="store_true",
                        help="Only scrape — don't send emails")
    parser.add_argument("--send-only", action="store_true",
                        help="Only send emails to already-scraped leads")
    parser.add_argument("--dry-run", action="store_true",
                        help="Scrape and print leads without saving or sending")
    parser.add_argument("--stats", action="store_true",
                        help="Show database stats and exit")
    return parser.parse_args()


def show_stats(db):
    stats = db.stats()
    print("\n═══════════════════════════════════════════")
    print("  Double Agent — Database Stats")
    print("═══════════════════════════════════════════")
    print(f"  Total leads:       {stats['total']}")
    for status, count in stats["by_status"].items():
        print(f"  {status:20s} {count}")
    print(f"  Sent today:        {stats['sent_today']} / 30")
    print("═══════════════════════════════════════════\n")


def main():
    args = parse_args()
    db = LeadDatabase()

    if args.stats:
        show_stats(db)
        return

    # Validate city/industry are provided for scrape/send operations
    if not args.city or not args.industry:
        print("❌ Error: --city and --industry are required for scraping and sending.")
        print("   Use --stats to view database stats without these arguments.")
        sys.exit(1)

    # ── Step 1: Scrape ────────────────────────────────────
    if not args.send_only:
        print(f"\n🕵️  Scraping {args.industry} businesses in {args.city}...\n")
        with LocalBusinessScraper() as scraper:
            leads = scraper.search_businesses(
                city=args.city,
                industry=args.industry,
                max_results=args.max_leads,
            )

        if not leads:
            print("⚠️  No leads found. Try a different city or industry.")
            return

        if args.dry_run:
            print(f"\n📋 DRY RUN — {len(leads)} leads found (not saved):\n")
            for i, lead in enumerate(leads, 1):
                print(f"  {i:2d}. {lead['business_name']:30s} | {lead['email']:30s} | {lead['website']}")
            return

        inserted, duplicates = db.add_leads_bulk(leads)
        print(f"\n💾 Saved {inserted} new leads ({duplicates} duplicates skipped)")
        show_stats(db)

    # ── Step 2: Send ──────────────────────────────────────
    if not args.scrape_only:
        if os.getenv("SMTP_HOST"):
            print("\n📧 Sending emails to scraped leads...\n")
            result = send_pending_leads(db, limit=30)
            print(f"\n📬 Results: {result['sent']} sent, "
                  f"{result['failed']} failed, "
                  f"{result['skipped_daily_limit']} skipped (daily cap)")
            show_stats(db)
        else:
            print("\n⚠️  SMTP not configured. Set credentials in .env to send emails.")
            print("   Run `cp .env.template .env` and fill in your details.\n")

    db.close()


if __name__ == "__main__":
    main()