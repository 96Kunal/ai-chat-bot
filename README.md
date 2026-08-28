# 🚀 NexusAI — Full-Stack AI College Assistant

> A modern, production-grade **AI-powered College Assistant** application engineered with **React, Vite, TypeScript, Tailwind CSS, Framer Motion, Node.js/Express, MongoDB, and the Google Gemini AI API**.

---

## 🌟 Key Features

### 1. 🤖 Intelligent Conversational AI
- **Streaming Responses**: Real-time token streaming with smooth cursor animation.
- **Campus Knowledge Grounding (RAG)**: Automatically detects college-specific questions (departments, faculty, clubs, rules, library hours) and grounds answers against verified campus records with grounding source citations.
- **Document-Contextual Chat**: Attach uploaded PDFs, lecture notes, or syllabi directly to your conversation.
- **Code Syntax Highlighting**: Highlighted code blocks with 1-click **Copy Code** button.
- **Voice Speech-to-Text Input**: Hands-free queries using Web Speech recognition.
- **Session Management**: Create multiple conversations, switch sessions, delete, or clear chat history.
- **Regenerate & Bookmark**: 1-click response regeneration and bookmarking to personal vault.

### 2. 📚 AI Study & Exam Studio
- **📅 Study Plan Generator**: Input subject, exam date, daily hours, and topics to get a day-by-day interactive checklist with weekly milestones.
- **💡 Concept Explainer**: Get intuitive real-world analogies, step-by-step technical breakdowns, code snippets, and common exam pitfalls to avoid.
- **🎯 Practice Quiz Arena**: Generate customized multiple-choice tests with immediate answer feedback, explanations, score calculations, and celebratory **confetti animations**.
- **📝 Important Exam Questions**: Predicts high-yield short & long questions with model answer structures and mark weightages.

### 3. 📄 Document Intelligence Assistant
- **Multi-Format Ingestion**: Upload PDF, DOCX, TXT, and Markdown files (up to 15MB).
- **Instant AI Summarization**: Automatic generation of executive summaries and key bulleted takeaways.
- **Document Q&A**: Ask targeted questions strictly within the uploaded document's context.

### 4. 🏛️ Campus Hub & College Directory
- **Departments & Laboratories**: Details on CSE, AI & DS, ECE, Mechanical, and computing clusters.
- **Faculty Directory**: Office locations, consultation hours, courses, and direct emails.
- **Clubs & Societies**: Turing Coding Club, Zenith AI & Robotics, Aura Cultural Society, IEEE chapters.
- **Facilities & 24/7 Library**: RFID digital learning lounge, food court, gym, and 24-hour medical hotline.
- **Academic Policies**: 75% attendance rule, relative GPA calculation, and re-evaluation guidelines.

### 5. 📅 Campus Events & Official Announcements
- **Events Calendar**: Filter hackathons, AI workshops, cultural fests, and career fairs with 1-click RSVP.
- **Official Notices Board**: Real-time circulars with priority badges (High, Medium, Urgent).

### 6. ⭐ Bookmarks Vault & Settings
- Save any AI response, quiz question, or study plan.
- Configure custom **Gemini API keys** in settings or use the backend default.

---

## 🏗️ Architecture & Tech Stack

```text
ai-college-assistant/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Layout, Chat, Prompts, Voice Input
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # Dashboard, Chat, Study, Docs, Campus Hub, Events, Settings, Auth
│   │   ├── services/           # Central API & Streaming client
│   │   └── types/              # TypeScript interfaces
│   └── ...
│
└── server/                     # Node.js + Express + TypeScript Backend
    ├── src/
    │   ├── config/             # MongoDB + Memory-Store & Gemini setup
    │   ├── controllers/        # Auth, Chat, Study, Document, College, Bookmarks
    │   ├── middleware/         # JWT Auth & Upload middleware
    │   ├── models/             # User, ChatSession, CollegeKnowledge, Document, Event, Announcement, Bookmark
    │   ├── routes/             # REST endpoints
    │   └── services/           # Gemini AI service, RAG Search, Document Parser, Auto-Seeder
    └── ...
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Gemini API Key**: Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
cd server
npm install

# (Optional) Add your GEMINI_API_KEY in server/.env
# GEMINI_API_KEY=your_key_here

npm run dev
```
> **Note**: The backend connects to your local MongoDB or automatically starts an embedded in-memory MongoDB store with pre-seeded campus knowledge, events, and notices!

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Demo Credentials
- **Instant Guest Login**: Click **"Quick 1-Click Guest Demo Login"** on the Sign In page.
- **Demo User**: `alex.student@horizon.edu` | Password: `DemoPass2026!`

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Student login (JWT) |
| `POST` | `/api/auth/demo` | 1-Click guest demo session |
| `POST` | `/api/chat` | AI conversation (supports SSE Streaming `stream: true`) |
| `GET` | `/api/chat/sessions` | List user chat sessions |
| `POST` | `/api/study/plan` | Generate personalized study plan |
| `POST` | `/api/study/explain` | Explain concept with analogy & code |
| `POST` | `/api/study/quiz` | Generate interactive practice quiz |
| `POST` | `/api/study/questions` | Predict high-yield exam questions |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX/TXT and extract AI summary |
| `POST` | `/api/documents/:id/ask` | Ask questions within document context |
| `GET` | `/api/knowledge/knowledge`| Search & list college directory items |
| `GET` | `/api/events/events` | List campus events with RSVP status |
| `POST` | `/api/events/events/:id/rsvp` | Toggle event RSVP |
| `GET` | `/api/announcements/announcements` | List official college notices |

---

## 🛡️ Security & Privacy
- Zero frontend exposure of secret API keys.
- Bcrypt password hashing & JWT token verification.
- Rate-limiting protection & file type validation.
