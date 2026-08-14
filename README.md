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
2. **Traffic Priority Signal Simulation**:
   - Virtual signal states: `NORMAL`, `PRIORITY_REQUESTED`, `APPROVED`, `AMBULANCE_PRIORITY_ACTIVE`, `RETURNING_TO_NORMAL`.
   - Software-only simulation with automated 300m/500m radius Haversine distance geofence trigger.
   - Traffic operator dashboard controls: Approve, Reject, Pause, and Manual Override.
   - Configurable countdown timer, approach direction indicators (North, South, East, West), and full audit logging.
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
