# ⚡ RoutineX — AI-Powered Daily Routine & Productivity Platform

> An intelligent, data-driven daily routine manager, habit builder, and AI productivity platform designed to help you build repeatable schedules, track real task completion, eliminate bottlenecks, and achieve your goals with guided AI recommendations.

---

## 🌟 Overview

**RoutineX** is an enterprise-grade productivity system built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Supabase**. It transforms chaotic schedules into structured momentum through an end-to-end workflow:

$$\text{Create Routine} \longrightarrow \text{Schedule Daily Tasks} \longrightarrow \text{Track Status} \longrightarrow \text{Calculate Productivity} \longrightarrow \text{Analyze Weekly Trends} \longrightarrow \text{AI Coach Pattern Analysis} \longrightarrow \text{Review \& Apply Suggestions} \longrightarrow \text{Refine Routine}$$

---

## ✨ Core Features

### 1. 📅 Personalized Daily Routine Builder (Feature One)
- **Custom Routine Management**: Build multiple lifestyle routines (e.g., Morning Focus, Deep Work Block, Evening Wind-Down).
- **Time & Duration Scheduling**: Define activities with start times, end times, durations, and categories (Study, Work, Health, Fitness, Personal Development, Other).
- **Flexible Repeat Schedules**: Set routines to repeat on specific days (Monday–Sunday) with quick presets (*Everyday*, *Weekdays*, *Weekends*).
- **Enable / Disable / Edit / Delete**: Pause routines without losing historical task data; confirm deletions with safety dialogs.
- **Activity Timeline**: Visual breakdown of scheduled activities and total planned hours.

### 2. ✅ Real-Time Daily Task Tracking (Feature Two)
- **Status Lifecycle**: Full support for `Pending` (⏳), `Completed` (✅), and `Missed` (❌) statuses.
- **Auto-Sync from Routines**: Active routines automatically populate daily task instances for today without duplicate tasks.
- **Overdue Detection**: Automatically flags unfinished tasks as missed when their deadline has passed while preserving upcoming pending tasks.
- **Multi-Status Filtering**: Filter today's tasks by status (*All*, *Pending*, *Completed*, *Missed*) with real-time count badges.
- **Interactive Controls**: One-click completion toggles, explicit mark-missed actions, and pending resets.

### 3. 📊 Dynamic Productivity Dashboard (Feature Three)
- **Real-Time Dynamic Calculations**: 100% computed from actual stored task records — never hardcoded or mocked.
- **Productivity Formula**:
  $$\text{Productivity \%} = \left(\frac{\text{Completed Tasks}}{\text{Eligible Scheduled Tasks}}\right) \times 100$$
  - *Numerator*: Completed tasks.
  - *Denominator*: Eligible tasks (Completed + Missed + Pending tasks whose scheduled start time has arrived).
  - *Future Guard*: Future pending tasks not yet due are excluded from penalizing the daily score.
  - *Zero-Division Guard*: Displays *"No Tasks Due"* when no eligible tasks exist rather than misleading 0%.
- **Progress Gauge & Breakdown**: Circular SVG progress gauge, schedule progress bar, and metric breakdown cards (Completed, Pending, Missed, Total Scheduled).

### 4. 📈 7-Day Weekly Productivity Trends (Feature Four)
- **Interactive Recharts Visualization**: Displays real completion percentages for the last 7 days.
- **Data Integrity**: Clearly differentiates days with no scheduled tasks from days with 0% productivity.
- **Detailed Tooltips**: Hover to inspect date, completed tasks, eligible tasks, missed tasks, and exact percentage.
- **Summary Metrics**:
  - **Weekly Average**: Computed exclusively from active scheduled days.
  - **Best Day**: Identifies peak productivity days (e.g., *Wednesday (88%)*).
  - **Weekly Totals**: Total completed vs. total missed tasks.
  - **Trend Indicator**: Compares current week performance against the previous 7-day period.

### 5. 🤖 AI Productivity Coach (Feature Five)
- **Pattern & Bottleneck Recognition**: Analyzes historical task data to identify frequently missed activities, evening drop-offs, and overloaded schedules.
- **Data-Grounded Insights**: Explains the exact reason behind every insight based on user activity history.
- **Empathetic & Practical**: Focuses on actionable schedule shifts, habit downsizing, and friction reduction.

### 6. 🔄 AI Suggestions to Routine Updates (Feature Six)
- **Transparent Before vs. Proposed Comparison**: Inspect current activity schedule vs. AI proposed time and duration adjustments.
- **User Confirmation Safeguard**: AI *never* silently alters user routines. Changes are only applied upon explicit click of **"Apply Suggestion to Routine"**.
- **Atomic Schedule Updates**: Applying a suggestion instantly updates the master routine and adjusts upcoming daily tasks while preserving all unrelated activities.

### 7. 📬 Functional Contact Form with Email Delivery (Feature Seven)
- **Direct Delivery to Inbox**: Submissions are routed directly to **`arshukhan1600@gmail.com`**.
- **Validated Fields**: Full Name, Valid Email Address, Subject, and Message (min 5, max 3000 chars) with optional Phone.
- **Anti-Spam Protection**: Integrated invisible honeypot trap to silently capture and neutralize automated bot submissions.
- **Serverless Integration**: Backed by Supabase Edge Function `send-contact-email` with Resend API integration.
- **Interactive UX**: Async submission loading spinner, disabled state during sending, clear success confirmation, and form auto-reset.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS, Lucide React, class-variance-authority, Tailwind Animate |
| **UI Components** | Radix UI primitives, shadcn/ui components |
| **Data Visualization** | Recharts 2.12 |
| **Backend & Serverless** | Supabase (Auth, Database, Edge Functions with Deno) |
| **Email Delivery** | Resend API via Supabase Edge Function |
| **State & Storage** | Custom React hooks, LocalStorage persistence, TanStack Query |
| **Speech & Audio** | Web Speech API, Ambient Focus Sound Player |

---

## 📂 Project Structure

```text
daily-routinex/
├── public/                     # Static assets, icons, and favicon
├── src/
│   ├── assets/                 # Brand logos and images
│   ├── components/             # Reusable UI components
│   │   ├── AICoach/            # AI Coach & Recommendation modals
│   │   │   └── AICoachSection.tsx
│   │   ├── RoutineBuilder/     # Routine creation & activity manager
│   │   │   └── RoutineManagerModal.tsx
│   │   ├── ui/                 # Radix UI / shadcn component library
│   │   ├── Contact.tsx         # Functional contact form (arshukhan1600@gmail.com)
│   │   ├── DailyStats.tsx      # Category-based time distribution
│   │   ├── Footer.tsx          # Application footer & developer attribution
│   │   ├── Header.tsx          # Navigation & dark mode toggle
│   │   ├── PriorityMatrix.tsx  # Eisenhower 4-quadrant matrix
│   │   ├── ProductivityDashboard.tsx # Daily score gauge & breakdown
│   │   ├── TaskCard.tsx        # Task item with status controls
│   │   ├── TaskForm.tsx        # Add/edit task modal with start time
│   │   ├── TaskList.tsx        # Filtered task list with status tabs
│   │   ├── WeeklyProductivityChart.tsx # 7-day trend graph
│   │   └── ...
│   ├── hooks/                  # Custom hooks (useRoutines, useAuth, useLocalStorage)
│   ├── lib/                    # Productivity formulas & export utilities
│   │   └── productivity.ts     # Core productivity math & eligibility engine
│   ├── types/                  # TypeScript definitions (routine.ts, task.ts)
│   ├── pages/                  # Index.tsx, NotFound.tsx
│   ├── App.tsx                 # Root application wrapper
│   └── main.tsx                # React DOM entry point
├── supabase/
│   ├── functions/
│   │   ├── ai-coach/           # AI Coach Chat Edge Function
│   │   └── send-contact-email/ # Contact Form Email Delivery to arshukhan1600@gmail.com
│   └── migrations/             # Database schema & security policies
├── .env.example                # Environment variables template
├── package.json                # Dependencies and npm scripts
└── vite.config.ts              # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Najishanjum/Routinex-arshi.git
   cd Routinex-arshi/daily-routinex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📬 Contact Form Email Setup

Contact form submissions are delivered to **`arshukhan1600@gmail.com`**.

To enable transactional email delivery via the Supabase Edge Function:
1. Sign up for a free account at [Resend](https://resend.com) and generate an API key.
2. In your Supabase Dashboard, go to **Project Settings** $\rightarrow$ **Edge Functions** $\rightarrow$ **Secrets**.
3. Add the secret:
   ```text
   RESEND_API_KEY = re_your_resend_api_key
   ```
4. Deploy the edge function:
   ```bash
   supabase functions deploy send-contact-email
   ```
*(Note: If `RESEND_API_KEY` is not yet configured, the function logs the submission securely and returns an acknowledgment so that visitors are never blocked).*

---

## 👩‍💻 Developer & Contact Details

Developed and maintained with ❤️ by **Arshi Khan**.

- **Developer**: Arshi Khan
- **Phone**: [+91 94246 78050](tel:+919424678050)
- **Email**: [arshisaleem089@gmail.com](mailto:arshisaleem089@gmail.com)
- **Contact Inquiries**: [arshukhan1600@gmail.com](mailto:arshukhan1600@gmail.com)
- **Address**: Makka Nagar Adhartal, Jabalpur, Madhya Pradesh, India
- **Twitter / X**: [@ArshiKhan373342](https://x.com/ArshiKhan373342)
- **LinkedIn**: [Arshi Khan on LinkedIn](https://www.linkedin.com/in/arshi-khan-00483529a?utm_source=share_via&utm_content=profile&utm_medium=member_android)
- **GitHub Repository**: [https://github.com/Najishanjum/Routinex-arshi.git](https://github.com/Najishanjum/Routinex-arshi.git)

---

## 📄 License

This project is licensed under the **MIT License**.
