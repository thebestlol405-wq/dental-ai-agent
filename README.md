# 🕵️ Double Agent — Automated Local Outreach Pipeline

Find local businesses in any city, grab their contact info, and send
personalised cold emails — all from one script.

**Perfect for:** freelancers, agencies, and B2B sales reps who need
to reach MedSpas, dentists, auto shops, restaurants, and more.

---

## ⚡ Quick Start

### 1. Prerequisites

You need **Python 3.10+** installed on your machine.

Check if you have it:
```bash
python3 --version
```

### 2. Download the project

```bash
git clone <your-repo-url>
cd double-agent
```

### 3. Set up a virtual environment (recommended)

```bash
python3 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
playwright install chromium
```

> The `playwright install chromium` step downloads a headless browser
> that the scraper uses behind the scenes.

### 5. Configure your email credentials

```bash
cp .env.template .env
```

Open `.env` in any text editor and fill in:

| Variable       | What to put                                      |
|----------------|--------------------------------------------------|
| `SMTP_HOST`    | Your email provider's SMTP server (see below)    |
| `SMTP_PORT`    | `587` for most providers                         |
| `SMTP_USER`    | Your full email address                          |
| `SMTP_PASS`    | Your **app password** (not your regular password) |
| `FROM_NAME`    | Your name or company name                        |

**Getting an app password:**
- **Gmail:** https://myaccount.google.com/apppasswords (turn on 2FA first)
- **Outlook / Microsoft:** https://account.live.com/ — App passwords in Security settings
- **ProtonMail:** Use ProtonMail Bridge
- **SendGrid / Mailgun:** Use the SMTP API key as the password

---

## 🚀 Usage

### Scrape + Send (full pipeline)

```bash
python main.py --city "Toronto" --industry "MedSpa"
```

This will:
1. Search Google for "best MedSpa in Toronto"
2. Visit each business website to find a contact email
3. Save the leads to a local database (no duplicates)
4. Send a personalised email to each lead
5. Wait 1–3 minutes between each email (to avoid spam flags)
6. Stop after 30 emails per day

### Scrape only (no sending)

```bash
python main.py --city "Vancouver" --industry "Dentist" --scrape-only
```

### Send only (to already-scraped leads)

```bash
python main.py --send-only
```

### Dry run (preview without saving or sending)

```bash
python main.py --city "Montreal" --industry "Auto Shop" --dry-run
```

### Check stats

```bash
python main.py --stats
```

### More leads per run

```bash
python main.py --city "Calgary" --industry "Yoga Studio" --max-leads 30
```

---

## 📁 Project Structure

```
double-agent/
├── main.py                 # Orchestrator — run everything from here
├── scraper/
│   └── scraper.py          # Finds businesses & emails via web search
├── database/
│   └── database.py         # SQLite storage with duplicate detection
├── sender/
│   ├── sender.py           # SMTP email engine with safety limits
│   └── templates/
│       └── pitch_template.txt  # Email template with {{placeholders}}
├── .env.template           # Copy this to .env and fill in credentials
├── .env                    # Your actual credentials (never commit this!)
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

---

## 🛡️ Safety by Design

| Safety Feature              | Why it's there                                   |
|-----------------------------|--------------------------------------------------|
| **60–180s random delay**    | Avoids spam detection from rapid-fire sending    |
| **30 emails/day hard cap**  | Keeps your account safe from abuse flags         |
| **Duplicate prevention**    | Never emails the same business twice             |
| **SMTP STARTTLS**           | Encrypted connection to your email provider      |

---

## 🧪 Customising the email template

Edit `sender/templates/pitch_template.txt`. Use these placeholders:

- `{{business_name}}` — the lead's business name
- `{{industry}}`      — the industry you searched (e.g., MedSpa)
- `{{location}}`      — the city
- `{{email}}`         — the lead's email
- `{{from_name}}`     — your name (from .env)
- `{{from_email}}`    — your email (from .env)

---

## 🔒 Important notes

- **Do NOT commit your `.env` file** — it's in `.gitignore` automatically.
- Start with a small test run (`--max-leads 3`) to verify your setup works.
- Every search is a real Google query — don't abuse it.
- This tool is for **legitimate business outreach only**. Spamming is illegal and
  will get your email account suspended.

---

## 📊 KPIs to track

- **Leads per search** — how many businesses you find per city/industry
- **Email find rate** — what % of businesses have a public email
- **Bounce rate** — how many emails bounced vs. delivered
- **Reply rate** — how many leads replied (track this manually for now)

---

Built with ❤️ by Double Agent.