# Smart Ambulance Tracking, Traffic Priority Simulation & Emergency Resource Management System

A full-stack, software-based solution connecting emergency ambulances, hospital emergency departments, doctors, ward managers, sanitization staff, and city traffic controllers into an integrated, real-time emergency healthcare ecosystem.

> **Disclaimer**: This application is an educational prototype and decision-support simulation system. Automated bed recommendations and traffic signal overrides are for demonstration purposes and do not replace qualified medical professionals or official municipal traffic control authorities.

---

## 🌟 Key Features

1. **Ambulance Mobile Staff App**:
   - Patient intake & emergency registration (Triage level, symptoms, equipment needed).
   - Real-time GPS stream simulation along route waypoints.
   - Interactive Leaflet route map & live ETA calculator.
2. **Traffic Priority Simulation Module**:
   - Automatic 500-meter proximity detection trigger via Haversine geofence formula.
   - Emergency green-light priority override with visual ring animations and countdown timers.
   - Traffic operator manual override (Force Green, Reset Red, Conflict Prevention).
   - Complete signal priority event audit logging.
3. **AI-Powered Bed Recommendation Engine**:
   - Decision-support algorithm filtering & ranking beds based on triage level, equipment matching (Ventilators, Oxygen), isolation capability, floor proximity, and hospital capacity.
   - Alternate hospital & ward suggestions when target hospital beds are at 100% capacity.
4. **Complete Bed Status Flow**:
   - `Available` → `Reserved` → `Occupied` → `Under Cleaning` → `Available`
   - Role-gated state transitions between hospital staff, doctors, and sanitization teams.
5. **Hospital Emergency & Ward Dashboards**:
   - Live incoming ambulance feed with Socket.IO alerts.
   - One-click bed reservation & patient admission confirmation.
   - Real-time color-coded ward matrix board.
6. **Doctor Clinical Portal & Sanitization Hub**:
   - Doctor diagnosis & treatment recorder, discharge approval.
   - Mobile-friendly sanitization checklist for cleaning staff.
7. **System Admin & Operational Analytics**:
   - User account management across all 7 pre-seeded roles.
   - Recharts visual graphs for admissions by triage, bed occupancy, and exportable CSV reports.

---

## 🔑 Pre-Seeded Demo Login Credentials

You can instantly switch between roles using the **Role Switcher** in the top navigation bar, or log in with these credentials (Password: `password123`):

| Role | Email | Purpose |
| :--- | :--- | :--- |
| **System Administrator** | `admin@hospital.com` | Master control, system metrics, user roles |
| **Ambulance Staff** | `ambulance@emergency.com` | Mobile patient intake, live GPS stream |
| **Emergency Staff** | `emergency@hospital.com` | Incoming alerts, AI bed recommendation, reservation |
| **Doctor** | `doctor@hospital.com` | Clinical diagnosis, treatment notes, discharge |
| **Nurse / Ward Manager** | `nurse@hospital.com` | Ward matrix board, bed status changes |
| **Cleaning Staff** | `cleaner@hospital.com` | Post-discharge sanitization workflow |
| **Traffic Operator** | `traffic@city.gov` | Signal map, auto-green priority overrides |

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, Socket.IO, SQLite (`sqlite3` / `sqlite`), JWT, BcryptJS.
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, Leaflet (`leaflet`, `react-leaflet`), Recharts, Lucide Icons.
- **Database**: Zero-config SQLite database (`database.sqlite`) pre-seeded with 2 Hospitals, Wards, Beds, Ambulances, Resources, Traffic Signals, and Staff.

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

### 3. Run Automated Test Suite
```bash
cd backend
npm test
```

---

## 📜 API Documentation & Architecture

See detailed documentation in the `docs/` directory:
- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
