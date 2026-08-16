# CareLink Smart Ambulance, Emergency Bed, and Ambulance Priority Signal Management System

**CareLink Medical Center**  
*Connected Care. Faster Response. Better Outcomes.*

A full-stack, software-based solution connecting emergency ambulances, hospital emergency departments, doctors, ward managers, sanitization staff, and city traffic controllers into an integrated, real-time emergency healthcare ecosystem.

> [!IMPORTANT]
> **Traffic Signal Simulation — Demonstration Mode**  
> *This software prototype simulates emergency traffic priority. It does not directly control real public traffic signals.*  
>  
> **Mandatory Disclaimer**:  
> *This system is a software prototype for educational and demonstration purposes. It does not replace qualified medical professionals and does not directly control officially operated public traffic signals.*

---

## 🌟 Key System Features

1. **Ambulance Mobile Staff Web App**:
   - Mobile-responsive interface designed for smartphones and tablets.
   - Emergency patient intake registration (Triage level, symptoms, equipment requirements).
   - Real-time browser Geolocation API (`navigator.geolocation.watchPosition`) + simulated waypoint movement fallback.
   - Interactive Leaflet route map & live ETA calculation.
2. **Automated Traffic Priority Signal Simulation**:
   - Virtual signal states: `NORMAL`, `AMBULANCE_DETECTED`, `VALIDATING`, `AUTO_APPROVED`, `AMBULANCE_PRIORITY_ACTIVE`, `RETURNING_TO_NORMAL`.
   - Software-only simulation with automated 300m (Critical) / 250m (Urgent) radius Haversine distance geofence trigger.
   - GPS accuracy check ($\le 30$m) and multi-ambulance conflict queuing (`CONFLICT_QUEUED`).
   - Operator monitoring dashboard, countdown timers, approach direction indicators, and full audit logging.
3. **AI-Powered Bed Recommendation Scoring Engine**:
   - Decision-support scoring algorithm ranking beds based on triage level, equipment matching (Ventilators, Oxygen), isolation capability, floor proximity, and ward capacity.
   - Alternate hospital & bed recommendations when target ER capacity is at 100%.
4. **Complete 5-Stage Bed Status Lifecycle**:
   - `Available` → `Reserved` → `Occupied` → `Under Cleaning` → `Available`
   - Extended bed statuses: `Out of Service`, `Maintenance`, `Blocked`, `Waiting for Inspection`.
5. **Hospital Emergency & Ward Management**:
   - Live incoming ambulance feed with Socket.IO alerts and toast notifications.
   - One-click bed reservation and patient admission confirmation.
   - Color-coded visual ward matrix board.
6. **Doctor Clinical Portal & Sanitization Hub**:
   - Doctor diagnosis & treatment recorder, medical notes, discharge approval.
   - Mobile-friendly sanitization checklist for cleaning staff.
7. **System Administration & Analytics**:
   - Administrator Reset Map Demonstration Data tool (`POST /api/admin/reset-map-demo`).
   - User account management across all 7 pre-seeded roles.
   - Recharts visual graphs for admissions by triage level, bed occupancy metrics, and exportable analytics reports.

---

## 👥 Main User Roles & Demo Credentials

You can log in with any of these pre-seeded demo credentials (Password: `password123`) or switch roles instantly using the **Role Switcher** in the top navigation bar:

| Role | Email | System Role & Purpose |
| :--- | :--- | :--- |
| **Administrator** | `admin@hospital.com` | Master system control, analytics, user management |
| **Ambulance Staff** | `ambulance@emergency.com` | Mobile patient intake, live GPS stream |
| **Hospital Emergency Staff** | `emergency@hospital.com` | Incoming alerts, AI bed recommendation, reservation |
| **Doctor** | `doctor@hospital.com` | Clinical diagnosis, treatment notes, discharge |
| **Nurse or Ward Manager** | `nurse@hospital.com` | Ward matrix board, bed status updates |
| **Cleaning Staff** | `cleaner@hospital.com` | Post-discharge sanitization checklist |
| **Traffic-Control Operator** | `traffic@city.gov` | Signal map, auto-green priority overrides |

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Leaflet (`react-leaflet`), Recharts, Lucide React icons.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, SQLite (`sqlite3` / `sqlite`), JWT Authentication, BcryptJS.
- **Database**: Zero-config SQLite database (`database.sqlite`) pre-seeded with 2 Hospitals, Wards, Beds, Ambulances, Resources, Traffic Signals, and Staff.

---

## 🔧 Production Troubleshooting & Deployment Guide

### 1. Netlify Environment Variables
Set these environment variables in your Netlify site settings (**Site configuration** → **Environment variables**):
```env
VITE_API_URL=https://YOUR_DEPLOYED_BACKEND_URL
VITE_SOCKET_URL=https://YOUR_DEPLOYED_BACKEND_URL
```

### 2. Backend Deployment & CORS Configuration
Ensure your Express backend server allows your Netlify domain (`https://nimble-florentine-0de327.netlify.app`):
```typescript
app.use(cors({
  origin: ['https://nimble-florentine-0de327.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
```

### 3. HTTPS & Secure WebSockets
- In production, ensure both frontend and backend use `https://` protocols.
- Socket.IO automatically upgrades to secure WebSockets (`wss://`).

### 4. Health-Check Testing
Verify backend health by calling:
```bash
curl -X GET https://YOUR_DEPLOYED_BACKEND_URL/api/health
```
Expected JSON Response:
```json
{
  "status": "ok",
  "service": "carelink-backend",
  "timestamp": "2026-08-16T10:15:00.000Z"
}
```

### 5. Database & Seed Initialization
The SQLite database file (`database.sqlite`) automatically initializes schema and seeds 7 demo user accounts upon backend startup.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install & Run Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend API runs at: `http://localhost:5000` (SQLite DB automatically initializes & seeds).*

### 2. Install & Run Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs at: `http://localhost:3000`.*

### 3. Run Automated Integration Test Suite
```bash
cd backend
npm test
```

---

## 📜 API Documentation & Architecture

See detailed documentation in the `docs/` directory:
- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
