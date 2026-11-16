# ⚡ RoutineX — Personal Productivity & Habit Tracker

> An intelligent, privacy-first daily routine manager, habit builder, and AI productivity assistant designed to help you organize your daily tasks, stay focused, and achieve your goals effortlessly.

---

## 🌟 Overview

**RoutineX** is a modern, responsive web application engineered to transform daily chaos into structured momentum. Combining intuitive task management, voice input, ambient focus music, visual habit timelines, and AI-powered coaching, RoutineX gives you all the tools you need to optimize your daily routine while keeping your personal data secure and private on your device.

---

## ✨ Features at a Glance

### 🎯 Smart Routine & Task Management
- **Multiple Views**: Seamlessly switch between **Daily**, **Weekly**, and **Monthly** calendar perspectives.
- **Priority & Categorization**: Organize tasks by custom categories (Work, Personal, Fitness, Study, etc.) and priority levels.
- **Instant Search & Filters**: Find tasks instantly by keyword, status, category, or date.
- **Task Analytics**: Daily completion percentages, progress bars, and historical trends.

### 🎙️ Voice Task Entry & Voice Assistant
- **Speech-to-Text Input**: Dictate your tasks on the go using browser-native speech recognition.
- **Text-to-Speech Assistant**: Audio readouts and auditory feedback for your daily plan.

### 🤖 AI-Powered Coaching & Goal Planning
- **AI Chat Coach**: Get personalized motivation, routine suggestions, and productivity advice.
- **AI Goal Planner**: Break large, intimidating ambitions into bite-sized, actionable milestones.

### 🎧 Ambient Focus Music & Audio Player
- **Integrated Focus Sounds**: Calming background audio and binaural beats designed for deep work.
- **Floating Music Controller**: Persistent playback control accessible across all views.

### 📸 Daily Snap Tracker & Photo Timeline
- **Visual Progress Logging**: Attach photos and snapshots to celebrate daily consistency.
- **Photo Timeline**: Scroll through a visual history of your completed routines.

### 🏆 Streaks, Rewards & Certificates
- **Streak Tracking**: Maintain daily streaks to gamify your habits.
- **Milestone Rewards**: Unlock celebratory badges and achievements.
- **Printable Certificates**: Generate and download official RoutineX Progress Certificates.

### 🖨️ "Print My Day" & Data Export
- **Printable Daily Sheet**: Clean, printer-friendly one-page agenda sheet for analog planning.
- **Data Backup & Restore**: One-click JSON backup export to keep your records safe.

### 🌱 Micro Habits & Mini-Courses
- **Micro Habits Engine**: Build tiny, compoundable positive habits without burnout.
- **Bite-Sized Mini Courses**: In-app productivity guides on deep work, time management, and habit loops.

### 👥 Friend Mode / Accountability Buddy
- Connect with friends and accountability partners to boost follow-through.

### 🌓 Glassmorphism UI & Dark Mode
- Sleek, modern glassmorphism aesthetic built with Tailwind CSS.
- Full light and dark theme support with automatic persistence.

### 🔒 Privacy-First Architecture
- All core routine and task data is stored locally in your browser (`localStorage`).
- Your data remains in your control without unsolicited third-party tracking.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Framework & Core** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) |
| **Backend & Cloud Services** | [Supabase](https://supabase.com/) (Auth, Database, Edge Functions) |
| **State & Query** | [TanStack React Query](https://tanstack.com/query) |
| **Toasts & Feedback** | [Sonner](https://sonner.emilkowal.ski/) |
| **Speech APIs** | Web Speech API (SpeechRecognition & SpeechSynthesis) |

---

## 📂 Project Structure

```text
daily-routinex/
├── public/                 # Static assets, icons, and favicon
├── src/
│   ├── assets/             # Logos and media assets
│   ├── components/         # Reusable modular UI components
│   │   ├── ui/             # Radix UI / shadcn component library
│   │   ├── AIChatCoach.tsx         # AI Productivity Coach
│   │   ├── AIGoalPlanner.tsx       # Milestone & Goal Planner
│   │   ├── Contact.tsx             # Contact Information & Inquiry Form
│   │   ├── DailyStats.tsx          # Real-time task statistics
│   │   ├── FocusMusic.tsx          # Ambient focus music player
│   │   ├── Footer.tsx              # Application footer & developer credits
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── MicroHabits.tsx         # Tiny habits management
│   │   ├── PhotoTimeline.tsx       # Visual timeline of routine photos
│   │   ├── PrintMyDay.tsx          # Printable physical daily schedule
│   │   ├── ProgressCertificate.tsx # Printable milestone certificates
│   │   ├── TaskCard.tsx            # Interactive task display
│   │   ├── TaskForm.tsx            # Add/Edit task modal
│   │   ├── TaskList.tsx            # Filtered list view of tasks
│   │   └── ...
│   ├── hooks/              # Custom React hooks (useAuth, useLocalStorage, useDarkMode)
│   ├── integrations/       # Supabase client & generated database types
│   ├── lib/                # Utility helpers & routine backup downloader
│   ├── pages/              # Primary route pages (Index, NotFound)
│   ├── types/              # TypeScript interfaces and type definitions
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── supabase/               # Supabase migrations & Edge Function definitions
├── index.html              # HTML entry point
├── package.json            # Project dependencies and npm scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── vite.config.ts          # Vite configuration
```

---

## 🚀 Getting Started

Follow these instructions to run RoutineX locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm`, `pnpm`, or `bun` package manager
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Najishanjum/Routinex-arshi.git
cd Routinex-arshi/daily-routinex
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Environment Configuration

Create a `.env` file in the root of the project (or use the existing template):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### 4. Run the Development Server

```bash
npm run dev
# or
bun run dev
```

Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

### 5. Build for Production

```bash
npm run build
```

The compiled, production-ready assets will be created in the `dist/` directory.

---

## 👩‍💻 Developer & Contact Details

Developed and maintained with ❤️ by **Arshi Khan**.

- **Developer**: Arshi Khan
- **Phone**: [+91 94246 78050](tel:+919424678050)
- **Email**: [arshisaleem089@gmail.com](mailto:arshisaleem089@gmail.com)
- **Address**: Makka Nagar Adhartal, Jabalpur, Madhya Pradesh, India
- **Twitter / X**: [@ArshiKhan373342](https://x.com/ArshiKhan373342)
- **LinkedIn**: [Arshi Khan on LinkedIn](https://www.linkedin.com/in/arshi-khan-00483529a?utm_source=share_via&utm_content=profile&utm_medium=member_android)
- **GitHub Repository**: [https://github.com/Najishanjum/Routinex-arshi.git](https://github.com/Najishanjum/Routinex-arshi.git)

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute this software for personal and commercial projects.
