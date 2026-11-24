# ConvoAI – AI-Powered Customer Support & Conversation Intelligence Platform

![ConvoAI Platform Banner](https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&h=400&q=80)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange.svg)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **ConvoAI** is a modern, enterprise-grade conversation intelligence and customer support SaaS platform built to empower modern support operations. Combining the design precision of Linear and Intercom with server-side OpenAI GPT-4o intelligence, event-driven workflow automation, real-time WebSockets, and deep analytics.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [Architecture Overview & System Flow](#5-architecture-overview--system-flow)
6. [Folder Structure](#6-folder-structure)
7. [Installation Instructions](#7-installation-instructions)
8. [Environment Variables](#8-environment-variables)
9. [Frontend Setup](#9-frontend-setup)
10. [Backend Setup](#10-backend-setup)
11. [Database Setup & Schemas](#11-database-setup--schemas)
12. [API Documentation](#12-api-documentation)
13. [AI Intelligence Engine (OpenAI Integration)](#13-ai-intelligence-engine-openai-integration)
14. [Automation Rules & Workflow Engine](#14-automation-rules--workflow-engine)
15. [Authentication & Role-Based Access Control (RBAC)](#15-authentication--role-based-access-control-rbac)
16. [Testing Instructions](#16-testing-instructions)
17. [Deployment Guide (Vercel, Render, Atlas)](#17-deployment-guide)
18. [User Interface Gallery](#18-user-interface-gallery)
19. [Live Demo & Verification](#19-live-demo--verification)

---

## 1. Project Overview

ConvoAI enables high-growth SaaS organizations to consolidate customer communication across web chat, email, Slack, and WhatsApp into a unified, high-performance Smart Inbox. With real-time message routing, AI-generated thread summaries, sentiment classification, deterministic workflow triggers, and granular SLA compliance reporting, support engineers and managers can eliminate manual triage and resolve critical tickets faster.

---

## 2. Problem Statement

Modern customer support teams struggle with:
* **Fragmented Communication**: Conversations are scattered across disconnected email threads, live chat widgets, and social messaging channels.
* **Triage Fatigue & SLA Breaches**: Support representatives manually review long threads to understand customer history, leading to slow first-response times and missed SLA thresholds.
* **Lack of Actionable Insights**: Team leaders lack visibility into root-cause sentiment trends, agent productivity benchmarks, and deflection analytics.
* **Fragile Automations**: Rigid legacy ticketing tools lack visual workflow builders that safely evaluate multi-condition logic (AND/OR) with guaranteed idempotency.

**ConvoAI solves these challenges** through an integrated single-pane interface featuring human-in-the-loop AI assistance and real-time event orchestration.

---

## 3. Key Features

* **Smart 3-Panel Inbox**:
  * Left: Searchable conversation list with live unread indicators, priority tags, and channel badges.
  * Center: Thread message stream with real-time delivery status (`sending`, `sent`, `delivered`, `read`), internal private notes, file attachments, and canned responses.
  * Right: Customer 360 profile context, ARR value, lifetime ticket history, and interactive account tags.
* **Real-time Messaging via Socket.IO**:
  * Bi-directional WebSocket communication, room-based message broadcasting (`conversation_${id}`), live customer typing indicators, and agent status synchronization.
* **Server-Side AI Copilot (OpenAI GPT-4o)**:
  * Conversation thread summarization (Executive overview, core issue, action items, recommended next steps).
  * 3-variant smart reply generator (`Empathetic`, `Concise`, `Formal`).
  * Real-time sentiment classification and churn-risk detection with human-in-the-loop safeguards.
* **Deterministic Workflow Engine**:
  * Event-driven triggers (`conversation.created`, `customer.sentiment.negative`, `sla.warning`).
  * Complex condition evaluator supporting `AND`/`OR` multi-branch logic across properties.
  * Action executors: Auto-assignment, priority elevation, Slack escalation, and webhook dispatch.
* **Advanced Analytics & Reports**:
  * Mathematically rigorous metrics computed from 90-day operational telemetry.
  * Outlier-resilient median first response time and SLA compliance percentages.
  * 6 pre-built reports with streaming RFC 4180 CSV export.
* **Enterprise Security & Settings**:
  * JWT access & refresh token rotation, bcrypt password hashing, login audit trail, and RBAC privilege matrices.

---

## 4. Technology Stack

### Frontend
* **React 18** with **TypeScript** for type-safe user interfaces.
* **Vite 5** with route-based lazy loading and Rollup chunk optimization.
* **Redux Toolkit** for centralized, predictable state management.
* **Tailwind CSS** for responsive design system styling.
* **Recharts** for interactive business telemetry and charts.
* **Socket.IO Client** for WebSocket event streams.
* **Lucide React** for modern UI icons.

### Backend
* **Node.js 20+** & **Express 5**.
* **Socket.IO Server** for WebSocket connection pools.
* **Mongoose & MongoDB** for scalable document persistence.
* **OpenAI Node SDK** with PII sanitization and exponential backoff fallback.
* **jsonwebtoken & bcryptjs** for enterprise authentication.

---

## 5. Architecture Overview & System Flow

```
                      +-----------------------------------+
                      |   ConvoAI Web Client (React 18)   |
                      +-----------------+-----------------+
                                        |
               HTTP REST APIs           |        WebSocket (Socket.IO)
         (JWT Bearer Authorization)     |      (Bi-directional Events)
                                        v
                      +-----------------+-----------------+
                      |     Node.js / Express Gateway     |
                      +--------+-----------------+--------+
                               |                 |
         +---------------------+                 +---------------------+
         |                                                             |
         v                                                             v
+-----------------+                                           +-----------------+
| OpenAI Engine   |                                           | MongoDB Atlas   |
| (GPT-4o API)    |                                           | (Mongoose ORM)  |
+-----------------+                                           +-----------------+
         |                                                             |
         v                                                             v
+-----------------+                                           +-----------------+
| Workflow Engine |                                           | Event Bus       |
| (Condition Eval)|                                           | (Rooms/Broadcast|
+-----------------+                                           +-----------------+
```

---

## 6. Folder Structure

```
convoAi/
├── .env.example                     # Environment template with dummy secrets
├── .gitignore                       # Production gitignore
├── index.html                       # HTML template
├── package.json                     # Dependencies & build scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind design tokens
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite bundler & proxy configuration
│
├── server/                          # Backend Express & Socket Server
│   ├── config/                      # Database & OpenAI configurations
│   ├── controllers/                 # Business logic controllers
│   ├── data/                        # Datasets & operational telemetry
│   ├── engine/                      # Automation trigger & condition engine
│   ├── middleware/                  # JWT auth, rate limiter & error handlers
│   ├── models/                      # 11 Mongoose database schemas
│   ├── routes/                      # API endpoint definitions
│   ├── services/                    # Statistical aggregation services
│   ├── socket.js                    # Socket.IO connection manager
│   ├── index.js                     # Express app & HTTP entrypoint
│   └── test-production-e2e.js       # Comprehensive 10-module test suite
│
└── src/                             # Frontend React 18 Application
    ├── app/                         # App providers, router & Redux store
    ├── components/                  # Layout shell & 17+ reusable UI primitives
    ├── constants/                   # Application constants & navigation
    ├── features/                    # Feature modules
    │   ├── agents/                  # Support agent management & profiles
    │   ├── ai-intelligence/         # OpenAI Studio & Copilot controls
    │   ├── analytics/               # Analytics dashboard & reports center
    │   ├── auth/                    # Login interface & auth services
    │   ├── automation/              # Visual workflow rule orchestrator
    │   ├── customers/               # Customer CRM & timeline
    │   ├── dashboard/               # High-level operational admin dashboard
    │   ├── inbox/                   # Smart 3-panel conversation manager
    │   ├── permissions/             # Role definitions & RBAC hooks
    │   ├── security/                # SOC-2 policies & authentication audits
    │   ├── settings/                # 9-module centralized settings hub
    │   └── teams/                   # Departmental routing configurations
    ├── hooks/                       # Custom React hooks (Theme, Debounce, etc.)
    ├── services/                    # Centralized Axios client & Socket service
    ├── styles/                      # Global Tailwind styles & fonts
    ├── types/                       # Shared TypeScript definitions
    └── utils/                       # Storage & formatters
```

---

## 7. Installation Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended).
* **npm**: v9.0.0 or higher.
* **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI.

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/convoai.git
cd convoai
```

### Step 2: Install Dependencies
```bash
npm install
```

---

## 8. Environment Variables

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Configure your variables:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/convoai
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_32_chars
OPENAI_API_KEY=sk-proj-your-api-key-here
OPENAI_MODEL=gpt-4o
```

---

## 9. Frontend Setup

Run the frontend development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## 10. Backend Setup

Start the Node.js Express & Socket.IO server:
```bash
npm run server
```
Server status check: `http://localhost:5000/health`.

---

## 11. Database Setup & Schemas

ConvoAI utilizes 11 Mongoose database models located in `server/models/`:

1. `User`: Account identity, bcrypt password hash, role (`admin`, `manager`, `agent`), workspace reference.
2. `Customer`: Profile info, ARR tier, lifecycle segment, sentiment history, account tags.
3. `Agent`: Performance metrics, max ticket capacity, team memberships, active tickets count.
4. `Team`: Routing definitions, assigned channels, team lead, urgent/resolution SLA parameters.
5. `Conversation`: Omnichannel metadata, ticket number, customer ref, status, priority, SLA flags.
6. `Message`: Individual message history, sender type, delivery status, attachments, internal note flag.
7. `AutomationRule`: Event trigger, AND/OR conditions tree, sequential actions list, status.
8. `AutomationExecution`: Audit log of rule executions, execution latency, action trace, errors.
9. `AiUsageRecord`: Token usage metrics, feature identifier, model name, estimated cost.
10. `Report`: Saved custom report definitions, format type, column selections, creator ref.
11. `Setting`: Workspace configuration, business hours, notification preferences, appearance theme.

---

## 12. API Documentation

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT tokens | Public |
| `POST` | `/api/auth/refresh` | Rotate access token via refresh token | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated profile | Authenticated |
| `GET` | `/api/customers` | Query & filter customer CRM directory | Authenticated |
| `POST` | `/api/customers` | Create new customer record | Authenticated |
| `GET` | `/api/conversations` | List conversation threads with filters | Authenticated |
| `POST` | `/api/conversations/:id/messages` | Send message & broadcast via WebSocket | Authenticated |
| `POST` | `/api/ai/summarize` | Generate GPT-4o conversation summary | Authenticated |
| `POST` | `/api/ai/suggest-reply` | Generate 3 contextual reply variations | Authenticated |
| `POST` | `/api/automations/test-trigger` | Simulate event against automation rules | Authenticated |
| `GET` | `/api/analytics/overview` | Retrieve aggregated business KPIs | Authenticated |
| `GET` | `/api/reports/export/:type` | Stream RFC 4180 CSV report export | Authenticated |
| `PUT` | `/api/settings/general` | Update workspace parameters | Admin / Owner |

---

## 13. AI Intelligence Engine (OpenAI Integration)

* **Architecture**: Strict server-side execution. The frontend never makes direct client-side requests to OpenAI.
* **PII Redaction**: Transcripts pass through automated regex sanitation (removing credit cards, social security numbers, and bearer keys) prior to prompt construction.
* **Human-in-the-Loop Safeguard**: AI suggestions are presented strictly as interactive drafts to agents. The platform enforces that no AI-generated response is sent to a customer without explicit human review and approval.
* **Resilient Fallback**: If an OpenAI quota or network error occurs, the server seamlessly switches to heuristic natural-language parsing, ensuring zero user-facing service disruptions.

---

## 14. Automation Rules & Workflow Engine

The event orchestrator (`server/engine/`) evaluates incoming lifecycle events against active rules:
* **Trigger Evaluation**: Matches events (`conversation.created`, `message.received`, `sentiment.changed`).
* **Condition Matching**: Parses multi-field logic trees with `AND` / `OR` combinators supporting operators (`equals`, `contains`, `greater_than`, `in`).
* **Safe Action Execution**: Dispatches atomic actions (`assign_agent`, `set_priority`, `add_tag`, `send_slack_alert`, `trigger_webhook`) with deduplication checks.

---

## 15. Authentication & Role-Based Access Control (RBAC)

* **Token Lifecycle**: Short-lived Access Tokens (15 minutes) signed via HMAC SHA-256 paired with rotating Refresh Tokens (7 days).
* **Role Boundaries**:
  * **Administrator**: Full global access, billing management, user provisioning, API keys.
  * **Manager**: Team oversight, assignment rules, conversation overrides, CRM export.
  * **Support Agent**: Assigned ticket triage, messaging, internal notes, profile settings.

---

## 16. Testing Instructions

### Run Production Integration & E2E Suite
```bash
node server/test-production-e2e.js
```
*Executes all 33 automated tests across Auth, CRM, Agents, Teams, Conversations, Sockets, AI, Automations, Analytics, Reports, and Settings.*

### Run Production Build Verification
```bash
npm run build
```
*Validates TypeScript compilation (`tsc -b`) and Vite production chunk bundling.*

---

## 17. Deployment Guide

### Deployment Architecture
```
React Frontend (Vercel)
        |
        | HTTPS REST APIs + WebSockets (Socket.IO)
        |
Node.js Backend (Render)
        |
        | Mongoose ODM
        |
MongoDB Atlas Cluster
```

### 1. Database Deployment (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. `Cluster0` - M0 Sandbox).
3. Under **Security > Database Access**:
   - Create a database user (e.g. `convoai_admin`). Choose password authentication and securely store the password.
   - Assign user privileges: `Read and write to any database`.
4. Under **Security > Network Access**:
   - Click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`) so Render cloud instances can connect.
5. Under **Deployment > Database**:
   - Click **Connect** -> **Drivers** (Node.js).
   - Copy connection string:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/convoai?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your created database credentials.

### 2. Backend Deployment (Render)
1. Log in to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository `convo-ai`.
3. Configure Service Settings:
   - **Name**: `convoai-backend` (or your preferred name)
   - **Root Directory**: `.` (leave empty for root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `npm run server`)
   - **Plan**: Free
4. Add Environment Variables in the **Environment** tab:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Render standard port (auto-assigned) |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(Random 32+ char string)* | Access token signing secret |
   | `JWT_REFRESH_SECRET` | *(Random 32+ char string)* | Refresh token signing secret |
   | `OPENAI_API_KEY` | `sk-proj-...` | OpenAI secret API key |
   | `OPENAI_MODEL` | `gpt-4o` | Model choice (`gpt-4o` or `gpt-4o-mini`) |
   | `FRONTEND_URL` | `https://<your-app>.vercel.app` | Vercel production origin for CORS |
5. Click **Create Web Service**.
6. Once deployed, verify the health check endpoint:
   `https://<your-render-subdomain>.onrender.com/api/health`
   Should return `{ "status": "ok", "subsystems": { ... } }`.

### 3. Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the `convo-ai` repository.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://<your-render-subdomain>.onrender.com/api` | Render backend REST API endpoint |
   | `VITE_SOCKET_URL` | `https://<your-render-subdomain>.onrender.com` | Render Socket.IO server endpoint |
5. Click **Deploy**.
6. Vercel automatically deploys the static single-page app and enforces client-side routing via `vercel.json`.

### 4. Post-Deployment Verification
1. Open your Vercel URL (e.g. `https://convoai.vercel.app`).
2. Log in with demo credentials (`sonam.sav@convoai.io` / `Password123!`).
3. Verify live Socket.IO connection in the browser console.
4. Test AI Smart Replies, Customer CRM, Automation Rules, and Analytics.

---

## 18. User Interface Gallery

| View | Screenshot / Description |
|---|---|
| **Admin Dashboard** | High-level metrics, Recharts area charts, priority queues, and agent rosters. |
| **Smart Inbox** | Three-panel responsive layout, omnichannel message stream, customer context 360. |
| **Customer CRM** | Searchable directory, ARR tracking, segment filters, account interaction notes. |
| **AI Intelligence** | Prompt studio, sentiment telemetry, automated thread summarizer. |
| **Automation Rules** | Visual workflow editor, trigger conditions, action execution trace. |
| **Advanced Analytics** | SLA compliance distributions, CSAT benchmarks, streaming CSV exports. |
| **Settings & Security** | 9-tab configuration center, password strength meter, active sessions manager. |

---

## 19. Live Demo & Verification

* **Demo URL**: `http://localhost:3000` (Local)
* **Default Demo Accounts**:
  * **Admin**: `sonam.sav@convoai.io` (or `admin@convoai.io`) / `Password123!` (Sonam Sav)
  * **Manager**: `manager@convoai.io` / `Password123!` (Marcus Vance)
  * **Agent**: `agent@convoai.io` / `Password123!` (Sarah Connor)
* **API Health Check**: `http://localhost:5000/health`

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
