# DoubleAgent: Real Estate Outreach Platform

DoubleAgent is a powerful automation tool designed for real estate professionals and agencies to discover leads, generate AI-powered outreach, and manage communication history.

## 🚀 Key Features

- **Agency Scraper:** Instantly find real estate agencies by city or region.
- **AI Email Assistant:** Generate personalized, high-converting outreach emails using Google Gemini 1.5 Flash.
- **Lead Management:** Organised CRM to track agency details, contact info, and outreach status.
- **Bulk Outreach:** Send personalized messages to multiple leads at once.
- **History Tracking:** Automatic logging of all outreach attempts for better follow-up.

## 🛠 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org) (App Router)
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React
- **Email:** Nodemailer (SMTP ready)

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd double-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini API Key for Scraper and Assistant
GEMINI_API_KEY=your_gemini_api_key

# Email SMTP Configuration (for sending outreach)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM="Your Name <your-email@gmail.com>"
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚢 Deployment (Vercel)

1. Connect your repository to [Vercel](https://vercel.com).
2. Add the environment variables listed above in the Vercel Project Settings.
3. **Important Persistence Note:** This project currently uses local JSON files in `src/data/` for data persistence. On Vercel, the file system is ephemeral. For a production-ready setup, it is recommended to integrate a database such as:
   - **Supabase** (PostgreSQL)
   - **MongoDB**
   - **Neon** (PostgreSQL)

   To transition, update the API routes in `src/app/api/` to use your database client instead of `fs.promises`.

## 📄 License

MIT
