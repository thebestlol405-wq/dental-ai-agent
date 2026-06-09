"""
database.py — SQLite lead storage with duplicate prevention and state management.

Stores scraped leads and tracks their lifecycle through the outreach pipeline.
States: Scraped → Queued → Sent
"""

import sqlite3
import os
from enum import Enum
from datetime import datetime
from typing import Optional


DB_PATH = os.path.join(os.path.dirname(__file__), "leads.db")


class LeadStatus(str, Enum):
    """Possible states for a lead in the pipeline."""
    SCRAPED = "Scraped"
    QUEUED = "Queued"
    SENT = "Sent"
    BOUNCED = "Bounced"
    REPLIED = "Replied"


class LeadDatabase:
    """Handles all SQLite operations for lead storage and retrieval."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._conn = sqlite3.connect(self.db_path)
        self._conn.row_factory = sqlite3.Row
        self._create_tables()

    # ── Schema ──────────────────────────────────────────────

    def _create_tables(self):
        cursor = self._conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                business_name   TEXT    NOT NULL,
                industry        TEXT    NOT NULL,
                location        TEXT    NOT NULL,
                email           TEXT    NOT NULL,
                website         TEXT    DEFAULT '',
                status          TEXT    NOT NULL DEFAULT 'Scraped',
                created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
                sent_at         TEXT,
                notes           TEXT    DEFAULT '',

                UNIQUE(business_name, email, location)
            );
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_leads_status
            ON leads(status);
        """)
        self._conn.commit()

    # ── Create ──────────────────────────────────────────────

    def add_lead(self, business_name: str, industry: str, location: str,
                 email: str, website: str = "", status: str = LeadStatus.SCRAPED
                 ) -> Optional[int]:
        """
        Insert a new lead. Returns its row id, or None if a duplicate
        (same business_name + email + location) already exists.
        """
        cursor = self._conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO leads (business_name, industry, location, email, website, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (business_name.strip(), industry.strip(), location.strip(),
                  email.strip().lower(), website.strip(), status))
            self._conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None  # Duplicate — silently skip

    def add_leads_bulk(self, leads: list[dict]) -> tuple[int, int]:
        """Insert many leads at once. Returns (inserted_count, duplicate_count)."""
        inserted = 0
        duplicates = 0
        for lead in leads:
            result = self.add_lead(**lead)
            if result is not None:
                inserted += 1
            else:
                duplicates += 1
        return inserted, duplicates

    # ── Read ────────────────────────────────────────────────

    def get_leads_by_status(self, status: str, limit: int = 50) -> list[dict]:
        """Fetch leads in a given state, oldest first."""
        cursor = self._conn.cursor()
        cursor.execute("""
            SELECT * FROM leads
            WHERE status = ?
            ORDER BY created_at ASC
            LIMIT ?
        """, (status, limit))
        return [dict(row) for row in cursor.fetchall()]

    def get_lead_by_id(self, lead_id: int) -> Optional[dict]:
        cursor = self._conn.cursor()
        cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    def count_by_status(self, status: str) -> int:
        cursor = self._conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM leads WHERE status = ?", (status,))
        return cursor.fetchone()[0]

    def get_daily_sent_count(self) -> int:
        """Number of emails sent today (UTC) — used to enforce the 30/day cap."""
        today = datetime.utcnow().strftime("%Y-%m-%d")
        cursor = self._conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM leads
            WHERE status = 'Sent' AND DATE(sent_at) = ?
        """, (today,))
        return cursor.fetchone()[0]

    def search_leads(self, **filters) -> list[dict]:
        """
        Flexible search. Supported keyword args: industry, location, status.
        Returns matching leads.
        """
        query = "SELECT * FROM leads WHERE 1=1"
        params = []
        for col in ("industry", "location", "status"):
            if col in filters:
                query += f" AND {col} = ?"
                params.append(filters[col])
        query += " ORDER BY created_at DESC"
        cursor = self._conn.cursor()
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    # ── Update ──────────────────────────────────────────────

    def update_status(self, lead_id: int, new_status: str) -> bool:
        """Transition a lead to a new status. Returns True if updated."""
        cursor = self._conn.cursor()
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        if new_status == LeadStatus.SENT:
            cursor.execute("""
                UPDATE leads SET status = ?, sent_at = ?, updated_at = ?
                WHERE id = ?
            """, (new_status, now, now, lead_id))
        else:
            cursor.execute("""
                UPDATE leads SET status = ?, updated_at = ? WHERE id = ?
            """, (new_status, now, lead_id))
        self._conn.commit()
        return cursor.rowcount > 0

    # ── Stats ───────────────────────────────────────────────

    def stats(self) -> dict:
        """Return summary counts for the dashboard."""
        cursor = self._conn.cursor()
        cursor.execute("""
            SELECT status, COUNT(*) as cnt FROM leads GROUP BY status
        """)
        rows = cursor.fetchall()
        counts = {row["status"]: row["cnt"] for row in rows}
        return {
            "total": sum(counts.values()),
            "by_status": counts,
            "sent_today": self.get_daily_sent_count(),
        }

    # ── Teardown ────────────────────────────────────────────

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
