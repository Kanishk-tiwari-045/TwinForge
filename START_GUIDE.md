# DigiTwin SaaS - Startup & Functionality Guide

## 📋 Prerequisites

Before starting the project, ensure you have:
- **Node.js** (v18 or higher)
- **Neon Database** account with Neon Auth enabled
- **Google Gemini AI** API key
- **Chrome Browser** (for extensions)

---

## 🚀 Quick Start

### Step 1: Environment Setup

1. **Copy the environment template:**
```powershell
Copy-Item .env.example .env
```

2. **Edit `.env` file with your credentials:**
```env
# Neon Database Connection (Backend only)
DATABASE_URL=postgresql://your-username:your-password@your-project.region.aws.neon.tech/neondb?sslmode=require

# Neon Auth Configuration
VITE_NEON_AUTH_URL=https://your-project.neonauth.region.aws.neon.tech/neondb/auth
NEON_JWKS_URL=https://your-project.neonauth.region.aws.neon.tech/neondb/auth/.well-known/jwks.json
NEON_PROJECT_ID=your-project-id

# Google Gemini AI API Key (Get from: https://aistudio.google.com/app/apikey)
VITE_GEMINI_API_KEY=your-actual-gemini-api-key

# Backend Server Configuration
PORT=3000

# Frontend API URL (for development)
VITE_API_URL=http://localhost:3000
```

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Database Setup

1. **Run the database setup script in Neon SQL Editor:**
   - Go to your Neon Console
   - Navigate to SQL Editor
   - Copy and paste the contents of `database-setup.sql`
   - Execute the script

2. **Verify tables were created:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Step 4: Start the Application

**Option A: Start everything together (Recommended)**
```powershell
npm start
```

**Option B: Start separately**

Terminal 1 - Frontend (Vite Dev Server):
```powershell
npm run dev
```

Terminal 2 - Backend (Express Server):
```powershell
npm run server
```

### Step 5: Load Chrome Extensions

**Gmail Extractor Extension:**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Navigate to `d:\WEBDEV\TwinForge\extensions\gmail-extractor`
5. Select the folder

**History Tracker Extension:**
1. Repeat the same steps
2. Navigate to `d:\WEBDEV\TwinForge\extensions\history-tracker`
3. Select the folder
4. **Important:** Click on the extension icon and enter your email address
5. Click "Save Email" to start tracking

> **Note:** The History Tracker requires you to enter your email address in the popup to associate browsing data with your account.

---

## 🏗️ Project Architecture

### Frontend (React + TypeScript + Vite)
**Port:** `http://localhost:5173`

**Main Components:**
- **Landing Page** (`/`) - Hero, Features, Pricing sections
- **Authentication** (`/login`, `/signup`) - User login/signup with Neon Auth
- **Dashboard** (`/dashboard/*`) - Main user interface after login
- **News Feed** (`/news-feed`) - Personalized news based on browsing history
- **Research Assistant** (`/research-assistant`) - AI-powered web content summarizer
- **Email Assistant** (`/user-prompting`) - AI-powered email response generator
- **Calendar** (`/calendar`) - Task and event management
- **Emails** (`/emails`) - Email management interface

**Key Features:**
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Framer Motion for animations

### Backend (Express.js + Node.js)
**Port:** `http://localhost:3000`

**API Routes:**

1. **Email Routes** (`backend/routes/emails.js`)
   - `GET /api/emails` - Fetch all emails from database
   - Manages emails extracted by Gmail extension

2. **AI Routes** (`backend/routes/ai.js`)
   - `POST /api/summarize` - Summarize web articles using Gemini AI
   - `POST /api/detect-ai` - Detect AI-generated content
   - `POST /api/research-insights` - Generate research insights from URLs

3. **User Routes** (`backend/routes/user.js`)
   - `POST /api/analyze-style` - Analyze user's writing style
   - `POST /api/generate-response` - Generate personalized email responses
   - Uses Gemini AI to learn and replicate user's writing patterns

**Database Configuration:**
- PostgreSQL connection via Neon Database
- Connection pooling with SSL enabled
- Row Level Security (RLS) for user data isolation

### Chrome Extensions

**1. Gmail Extractor** (`extensions/gmail-extractor/`)
- **Purpose:** Extract emails from Gmail and send to backend
- **Activation:** Automatically activates when you visit Gmail
- **Functionality:**
  - Extracts subject, body, sender, date from emails
  - Sends data to `http://localhost:3000/api/emails`
  - Stores in `emails` table for AI analysis

**2. History Tracker** (`extensions/history-tracker/`)
- **Purpose:** Track browsing history for personalized news feed
- **Activation:** Runs in background continuously
- **Setup Required:** Enter your email in the extension popup
- **Functionality:**
  - Records visited URLs, titles, and visit duration
  - Analyzes interest patterns
  - Sends data to `http://localhost:3000/api/history`
  - Stores in `browsing_history` table

---

## 🔄 How DigiTwin Functions

### 1️⃣ User Authentication Flow
```
User Signs Up → Neon Auth creates account → Profile created in public.profiles
         ↓
User Logs In → JWT token issued → Token stored in localStorage
         ↓
Protected routes accessible → User can access Dashboard
```

### 2️⃣ Email Intelligence Workflow
```
Gmail Extension → Extracts emails → Sends to /api/emails
         ↓
Stored in database → AI analyzes writing style → Patterns stored
         ↓
User requests reply → AI generates personalized response → Matches user's tone
```

**Example:**
- User writes formal emails → AI learns formal tone
- User receives new email → Clicks "Generate Reply"
- AI creates response in same formal style

### 3️⃣ Personalized News Feed
```
History Tracker → Records browsing patterns → Analyzes interests
         ↓
Categories identified (tech, sports, finance, etc.)
         ↓
News Feed fetches articles → Filters by user interests → Displays relevant news
```

**Example:**
- User frequently visits tech sites → News Feed shows tech articles
- User reads sports news → Sports category prioritized

### 4️⃣ Research Assistant
```
User pastes article URL → /api/summarize endpoint
         ↓
Backend fetches content → Gemini AI processes
         ↓
Generates summary → Returns key points → Displays to user
```

**Features:**
- **Summarize:** Get concise summaries of long articles
- **Detect AI:** Check if content is AI-generated
- **Research Insights:** Extract key insights and themes

### 5️⃣ Task Management
```
Emails/Calendar events → Parsed for action items → Stored in tasks table
         ↓
Calendar component displays → User can mark complete → Updates database
```

---

## 🗄️ Database Schema Overview

**Core Tables:**

1. **profiles** - User account information
   - `id` (UUID) - User unique identifier
   - `username`, `email` - User credentials
   - `subscription` - Plan type (free/pro/enterprise)

2. **emails** - Extracted Gmail emails
   - `subject`, `body`, `sender`, `date`
   - Used for AI writing style analysis

3. **user_styles** - AI-learned writing patterns
   - `tone`, `vocabulary`, `humor`, `emoji_usage`
   - Enables personalized response generation

4. **browsing_history** - Tracked web visits
   - `url`, `title`, `duration`, `email`
   - Powers personalized news recommendations

5. **newsfeed** - Curated news articles
   - `title`, `content`, `category`, `interest`
   - Displayed in News Feed component

6. **user_responses** - AI-generated email replies
   - History of AI responses for learning

7. **tasks** - Action items from various sources
   - Email-derived tasks, manual tasks
   - Integrated with Calendar

---

## 🔐 Security Features

### Row Level Security (RLS)
- **Enabled on all user tables**
- Users can only access their own data
- Enforced at database level via `auth.uid()`

### JWT Authentication
- Neon Auth issues JWT tokens
- Tokens verified on protected routes
- Auto-refresh on expiration

### CORS Protection
- Backend only accepts requests from frontend
- Environment-based configuration

---

## 📊 Application Flow Example

**Complete User Journey:**

1. **Sign Up** → User creates account on `/signup`
   - Data stored in `neon_auth.users` (Neon Auth schema)
   - Profile created in `public.profiles`

2. **Install Extensions** → User loads both Chrome extensions
   - Gmail Extractor starts monitoring Gmail
   - History Tracker begins recording visits

3. **Browse Web** → History Tracker collects data
   - URLs and interests stored
   - Categories analyzed

4. **Check News Feed** → `/news-feed`
   - Shows articles matching browsing interests
   - AI-curated based on history

5. **Receive Email** → Gmail Extractor captures it
   - Email stored in database
   - AI analyzes writing style

6. **Generate Reply** → User clicks "Generate Response"
   - AI creates reply matching user's style
   - Based on previous email patterns

7. **Manage Tasks** → Calendar component
   - Tasks extracted from emails
   - User can track and complete

---

## 🛠️ Development Workflow

### Making Changes

**Frontend Changes:**
- Edit files in `src/`
- Vite hot-reloads automatically
- Check browser at `http://localhost:5173`

**Backend Changes:**
- Edit files in `backend/`
- Restart server: `npm run server`
- Test API with Postman or frontend

**Extension Changes:**
- Edit files in `extensions/`
- Go to `chrome://extensions/`
- Click reload icon on extension

### Testing

**Frontend:**
```powershell
npm run lint
```

**Backend API:**
Test endpoints with:
- Postman
- curl commands
- Frontend fetch calls

**Database:**
Run queries in Neon SQL Editor to verify data

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000 or 5173
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <process-id> /F
```

### Database Connection Failed
- Verify `DATABASE_URL` in `.env` is correct
- Check Neon Console for connection string
- Ensure database is not paused

### Extension Not Working
- Check if extensions are enabled in Chrome
- Verify manifest.json permissions
- Check Chrome console for errors

### Gemini AI Errors
- Verify `VITE_GEMINI_API_KEY` is correct
- Check API quota at Google AI Studio
- Ensure API key has proper permissions

---

## 📦 Build for Production

```powershell
# Build frontend
npm run build

# Preview production build
npm run preview
```

**Deployment:**
- Frontend: Deploy `dist/` folder to Vercel/Netlify
- Backend: Deploy to Railway/Render/Fly.io
- Extensions: Package for Chrome Web Store

---

## 🎯 Key Technologies

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Express.js** - Backend server
- **Neon PostgreSQL** - Database with Neon Auth
- **Google Gemini AI** - AI processing
- **Tailwind CSS** - Styling
- **Chrome Extensions API** - Browser integration

---

## 📞 Support

For issues or questions:
1. Check console logs (browser and terminal)
2. Verify `.env` configuration
3. Check Neon Database connection
4. Review API key validity

---

**🎉 Your DigiTwin SaaS is now ready to run!**

Access the application at: `http://localhost:5173`
Backend API at: `http://localhost:3000`
