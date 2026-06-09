"""
sender.py — SMTP-driven email automation engine with safety limits.

Features:
- Dynamic template injection (business_name, industry placeholders)
- Randomised delays between 60–180 seconds
- Hard 30-emails-per-24h cap (checks database)
- Secure STARTTLS connection
"""

import os
import time
import random
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


logger = logging.getLogger("sender")


class EmailSender:
    """Sends templated cold emails to leads via SMTP with safety limits."""

    DAILY_LIMIT = 30
    DELAY_MIN = 60
    DELAY_MAX = 180

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("FROM_NAME", "Double Agent")

        if not all([self.smtp_host, self.smtp_user, self.smtp_pass]):
            raise ValueError(
                "SMTP credentials not configured. "
                "Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file."
            )

        self._server: Optional[smtplib.SMTP] = None

    # ── Connection ──────────────────────────────────────────

    def connect(self):
        """Open a secure SMTP connection via STARTTLS."""
        self._server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30)
        self._server.ehlo()
        self._server.starttls()
        self._server.ehlo()
        self._server.login(self.smtp_user, self.smtp_pass)
        logger.info(f"Connected to {self.smtp_host}:{self.smtp_port} as {self.smtp_user}")

    def disconnect(self):
        if self._server:
            try:
                self._server.quit()
            except Exception:
                self._server.close()
            self._server = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, *args):
        self.disconnect()

    # ── Templates ───────────────────────────────────────────

    def _load_template(self, template_name: str = "pitch_template.txt") -> str:
        """Load an email template from the templates directory."""
        template_dir = os.path.join(os.path.dirname(__file__), "templates")
        path = os.path.join(template_dir, template_name)
        if not os.path.exists(path):
            # Return a default template if file is missing
            return (
                "Hi {{business_name}},\n\n"
                "I came across {{business_name}} in {{location}} and wanted to reach out. "
                "We help {{industry}} businesses like yours grow their client base "
                "through targeted digital outreach.\n\n"
                "Would you be open to a quick chat this week?\n\n"
                "Best regards,\n{{from_name}}"
            )
        with open(path, "r") as f:
            return f.read()

    def _render_template(self, template: str, variables: dict) -> str:
        """Replace {{placeholders}} with actual values."""
        rendered = template
        for key, value in variables.items():
            rendered = rendered.replace("{{" + key + "}}", str(value))
        return rendered

    # ── Build & send ────────────────────────────────────────

    def _build_message(self, to_email: str, to_name: str, variables: dict) -> str:
        """Build the email plaintext body from template + variables."""
        template = self._load_template()
        # Add standard variables
        full_vars = {
            "business_name": to_name,
            "email": to_email,
            "from_name": self.from_name,
            "from_email": self.from_email,
            **variables,
        }
        return self._render_template(template, full_vars)

    def _send_one(self, to_email: str, body: str, subject: str) -> bool:
        """Send a single email. Returns True on success."""
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg["Message-ID"] = f"<{datetime.utcnow().timestamp()}.{hash(to_email)}@doubleagent>"

        # Plain text part
        msg.attach(MIMEText(body, "plain", "utf-8"))

        if not self._server:
            raise RuntimeError("SMTP not connected. Call connect() first.")

        try:
            self._server.sendmail(self.from_email, [to_email], msg.as_string())
            logger.info(f"✓ Sent to {to_email}")
            return True
        except smtplib.SMTPRecipientsRefused as e:
            logger.warning(f"✗ Refused by {to_email}: {e}")
            return False
        except smtplib.SMTPServerDisconnected:
            logger.warning("Server disconnected — reconnecting...")
            self.disconnect()
            self.connect()
            return self._send_one(to_email, body, subject)
        except Exception as e:
            logger.error(f"✗ Failed to send to {to_email}: {e}")
            return False

    # ── High-level send pipeline ────────────────────────────

    def send_leads(self, leads: list[dict], subject: str = None,
                   template_variables: dict = None,
                   daily_limit: int = None) -> dict:
        """
        Send emails to a list of lead dicts with safety limits.

        Args:
            leads: List of dicts with 'email', 'business_name', 'location', 'industry'
            subject: Email subject line (supports {{placeholders}})
            template_variables: Extra variables for template rendering
            daily_limit: Override the daily sending cap (default 30)

        Returns:
            dict with keys: sent, failed, skipped_daily_limit
        """
        daily_limit = daily_limit or self.DAILY_LIMIT
        template_variables = template_variables or {}
        subject_template = subject or "Hello {{business_name}} – a quick note"

        if not self._server:
            self.connect()

        sent = 0
        failed = 0
        skipped = 0
        today_sent = 0  # We'll track this in memory; caller passes leads incrementally

        for i, lead in enumerate(leads):
            # ── Daily limit check ───────────────────────────
            if sent + failed + skipped >= daily_limit:
                logger.info(f"Daily limit ({daily_limit}) reached — stopping.")
                skipped = len(leads) - i
                break

            to_email = lead["email"]
            to_name = lead.get("business_name", "there")
            variables = {
                "location": lead.get("location", ""),
                "industry": lead.get("industry", ""),
                **template_variables,
            }

            # Render subject with variables
            rendered_subject = self._render_template(subject_template, {
                "business_name": to_name,
                **variables,
            })

            body = self._build_message(to_email, to_name, variables)

            success = self._send_one(to_email, body, rendered_subject)
            if success:
                sent += 1
            else:
                failed += 1

            # ── Randomised delay between emails ────────────
            if i < len(leads) - 1 and sent + failed < daily_limit:
                delay = random.uniform(self.DELAY_MIN, self.DELAY_MAX)
                logger.info(f"   Waiting {delay:.0f}s before next send...")
                time.sleep(delay)

        return {
            "sent": sent,
            "failed": failed,
            "skipped_daily_limit": skipped,
        }


def send_pending_leads(db, limit: int = 30) -> dict:
    """
    Convenience: load 'Scraped' leads from DB, send them, update status to 'Sent'.
    Respects the 30/day cap by checking today's count first.

    Args:
        db: LeadDatabase instance
        limit: Max emails to send in this run

    Returns:
        dict with sent/failed/skipped counts
    """
    from database import LeadStatus

    # Check how many already sent today
    already_sent = db.get_daily_sent_count()
    remaining = EmailSender.DAILY_LIMIT - already_sent

    if remaining <= 0:
        logger.info(f"Daily limit already reached ({already_sent} sent today). Skipping.")
        return {"sent": 0, "failed": 0, "skipped_daily_limit": 0}

    to_send = min(limit, remaining)
    leads = db.get_leads_by_status(LeadStatus.SCRAPED, limit=to_send)

    if not leads:
        logger.info("No 'Scraped' leads to send.")
        return {"sent": 0, "failed": 0, "skipped_daily_limit": 0}

    with EmailSender() as sender:
        result = sender.send_leads(leads, daily_limit=remaining)

    # Update status for successfully sent leads
    for lead in leads[: result["sent"]]:
        db.update_status(lead["id"], LeadStatus.SENT)

    return result