# 🎵 MELODIUM SJEC — Premium Full-Stack Website & Jam Room Booking System

**Official Digital Platform for Melodium SJEC — The Music Club & Community of St. Joseph Engineering College (SJEC), Mangaluru.**

> *"Where Music Finds Its Voice."*

---

## 🌟 Overview

Melodium SJEC is a production-grade, full-stack university music platform that seamlessly unifies public-facing club discovery, event promotion, visual performance galleries, and an atomic **1-Hour Jam Room Booking Engine** designed to prevent double-booking conflicts and provide digital rehearsal passes.

---

## 🚀 Key Features

### 🎸 1. Public Music Club Experience
- **Electric Yellow & Dark Grey Ambience**: Styled with an artistic modern university music identity, featuring electric yellow (`#FACC15`), rich gold (`#EAB308`), dark obsidian charcoal (`#12151C`), slate grey (`#64748B`), audio visualizers, and glassmorphic panels.
- **Dynamic Audio Equalizer Waveform**: 60fps canvas-driven harmonic equalizer reacting harmonically to simulate studio sound.
- **Events & Concerts Portal**: Filter by Upcoming, Ongoing, and Completed with RSVP tracking and dedicated event detail views.
- **Performance Photo Wall & Lightbox**: High-res categorized photography (Performances, Jam Sessions, Battle of the Bands, Behind the Scenes) with built-in lightbox modal and like counts.
- **Club Leadership & Artists**: Directory of Faculty Coordinators, Executive Committee, and Band Leads with instrument specialties and social links.

### 🎙️ 2. Jam Room Studio 1 Booking Engine
- **Strict 1-Hour Time Slots**: Generated dynamically according to configured operational hours (default: 09:00 AM – 06:00 PM).
- **Server-Side Concurrency & Race-Condition Lock**: Atomic conflict checks prevent double-booking even under millisecond-level simultaneous attempts.
- **Configurable Booking Policies**:
  - Jam Room opening/closing hours and slot durations.
  - Advance booking limit (default: 7 days).
  - Maximum daily quota (default: 1 slot/student) and weekly quota (default: 3 slots/student).
  - Cancellation cutoff window (default: 2 hours prior).
  - Optional Admin Manual Approval requirement mode.
  - Global Jam Room enabled/disabled toggle with custom maintenance notice.
- **Real-Time Slot States**: `Available`, `Booked`, `Blocked / Maintenance`, `Selected`, `Past`.
- **Digital Studio Pass**: Instant reservation confirmation with unique ID (e.g. `MEL-202610-A101`), instrument requirements, and cancellation actions.

### 🛡️ 3. Comprehensive Admin Dashboard
- **Live Daily Timeline**: Real-time slot-by-slot status with student names, USNs, contact info, session purpose, and direct action triggers (Approve, Reject, Cancel, Block).
- **Bookings Manager**: Searchable and filterable data table with pagination, CSV export, and status modification.
- **Slot Blocker**: Admin tool to lock out specific slots or full days for campus events, college holidays, band practice, or amplifier maintenance.
- **Interactive Calendar View**: Week-at-a-glance navigation for studio reservations.
- **Student & User Management**: Directory with USN verification, department breakdown, booking counters, role promotion/demotion, and deactivation.
- **Full CMS Control**: Create, edit, and delete Events, Gallery photos, and Team members.
- **Jam Room Analytics**: Charts for peak jamming hours, 30-day booking trendline, status distribution, and top active student musicians.
- **Audit Logs & Notifications**: Centralized system event logging and in-app alerts.

---

## 🔑 Demo Accounts

For evaluation and testing, the database includes pre-seeded accounts:

| Role | Email | Password | USN / Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sjec.ac.in` | `Admin@12345` | Melodium SJEC Lead Admin |
| **Student** | `johan@sjec.ac.in` | `Student@12345` | `4SO22CS089` (Lead Guitarist) |
| **Student** | `ananya@sjec.ac.in` | `Student@12345` | `4SO23AI045` (Classical Vocalist) |
| **Student** | `rohit@sjec.ac.in` | `Student@12345` | `4SO21ME032` (Drummer) |

*(Quick demo buttons are also provided directly on the Sign-In screen for 1-click login).*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Framer Motion, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose ODM, JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit.
- **Database**: MongoDB (Supports MongoDB Atlas, Local MongoDB, and automatic embedded fallback for zero-friction local development).
- **Timezone**: Indian Standard Time (`Asia/Kolkata` / UTC+05:30).

---

## 💻 Quick Start Guide (Local Development)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory (or use default configuration):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/melodium_sjec
JWT_SECRET=melodium_sjec_super_secret_jwt_key_2026_music_rocks
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TIMEZONE=Asia/Kolkata
```

### 3. Seed Database with Realistic SJEC Data
```bash
npm run seed
```

### 4. Start Development Servers (Backend + Frontend Concurrently)
```bash
npm run dev
```
- Frontend will be accessible at: `http://localhost:5173`
- Backend API will run at: `http://localhost:5000`

---

## 🍓 Raspberry Pi & Docker Deployment Guide

Melodium SJEC is fully optimized for **Raspberry Pi 3 / 4 / 5 and Raspberry Pi Zero 2W** (ARM64 / ARMv7) as well as any standard Linux VPS.

### Option A: 1-Command Docker Deployment (Recommended)

1. **Install Docker & Docker Compose on your Raspberry Pi**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   # Log out and log back in, or run: newgrp docker
   ```

2. **Clone & Configure Environment**:
   ```bash
   git clone <your-repo-url> melodium-sjec
   cd melodium-sjec
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI, JWT Secret, and Razorpay keys
   nano .env
   ```

3. **Build & Start Containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Access the Portal**:
   - Open your browser at `http://<your-raspberry-pi-ip>:5000` or `http://localhost:5000`.
   - The container automatically serves the frontend React SPA and the Node.js API together with built-in health monitoring and auto-restart.

---

### Option B: Native Node.js + PM2 Deployment on Raspberry Pi

1. **Install Node.js 20 LTS**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Install Dependencies & Build Client**:
   ```bash
   npm run install:all
   npm run build
   ```

3. **Start Production Server with PM2 (Auto-starts on reboot)**:
   ```bash
   cd server
   pm2 start index.js --name "melodium-sjec"
   pm2 startup
   pm2 save
   ```

---

### Option C: Reverse Proxy with Nginx (Optional Domain / SSL)
If using a custom domain (e.g. `melodium.sjec.ac.in`) with HTTPS / Let's Encrypt:
1. Copy `nginx.conf` to `/etc/nginx/sites-available/melodium-sjec`
2. Link it: `sudo ln -s /etc/nginx/sites-available/melodium-sjec /etc/nginx/sites-enabled/`
3. Run `sudo certbot --nginx -d melodium.sjec.ac.in` for free automated SSL.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new student profile
- `POST /api/auth/login` — Sign in and issue JWT
- `GET /api/auth/me` — Get current profile
- `PUT /api/auth/profile` — Update musician details
- `PUT /api/auth/change-password` — Change password

### Jam Room Bookings (`/api/bookings`)
- `GET /api/bookings/availability?date=YYYY-MM-DD` — Calculate real-time slot states
- `POST /api/bookings` — Atomically reserve 1-hour slot (Protected)
- `GET /api/bookings/my` — Fetch student's upcoming & past bookings
- `GET /api/bookings/:id` — Get single booking pass details
- `DELETE /api/bookings/:id` — Cancel booking (enforces 2-hr cutoff rule)

### Admin Operations (`/api/admin`)
- `GET /api/admin/overview` — Dashboard summary metrics & schedule
- `GET /api/admin/today-schedule?date=YYYY-MM-DD` — Slot-by-slot live status
- `GET /api/admin/bookings` — Search and filter all reservations
- `POST /api/admin/bookings` — Admin manual walk-in reservation
- `PATCH /api/admin/bookings/:id/status` — Approve, reject, or cancel
- `POST /api/admin/blocked-slots` — Block slot for maintenance or events
- `DELETE /api/admin/blocked-slots/:id` — Unblock slot
- `GET /api/admin/users` — Student list and role management
- `GET /api/admin/analytics` — Jam room utilization & peak hours calculation
- `GET /api/admin/activity-logs` — System audit logs

### CMS (`/api/events`, `/api/gallery`, `/api/team`, `/api/settings`)
- Complete CRUD endpoints for club content and booking parameter controls.

---

## 🏛️ St. Joseph Engineering College (SJEC)
*Vamanjoor, Mangaluru, Karnataka 575028*  
*Melodium SJEC Cultural Council*
