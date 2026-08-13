# REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication & Users

### `POST /api/auth/login`
Authenticates a user and returns JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "admin@hospital.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "name": "Dr. Sarah Connor",
      "email": "admin@hospital.com",
      "role_name": "System Administrator"
    }
  }
  ```

### `GET /api/auth/demo-accounts`
Returns list of all pre-seeded demo accounts for quick role testing.

---

## Hospitals & Bed Management

### `GET /api/hospitals`
Returns list of connected hospitals.

### `GET /api/hospitals/:id/beds`
Returns beds in target hospital with ward details and patient assignments.

### `PATCH /api/beds/:id/status`
Updates bed status (`Available`, `Reserved`, `Occupied`, `Under Cleaning`, `Out of Service`).
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "status": "Reserved"
  }
  ```

---

## Emergency Requests & Bed Recommendation

### `POST /api/emergency-requests`
Registers an emergency intake and transmits request to destination hospital.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "patient_name": "David Miller",
    "age": 48,
    "gender": "Male",
    "blood_group": "O+",
    "symptoms": "Acute Chest Pain, Dyspnea",
    "emergency_type": "CARDIAC",
    "triage_level": "Critical/Red",
    "required_equipment": "Ventilator, Oxygen",
    "ambulance_id": 1,
    "destination_hospital_id": 1,
    "current_latitude": 12.9550,
    "current_longitude": 77.5800,
    "estimated_arrival_time": 12
  }
  ```

### `GET /api/emergency-requests/:id/recommended-beds`
Computes bed recommendation scores for an emergency request.

### `POST /api/bed-reservations`
Reserves a bed for an incoming patient (`Available` → `Reserved`).

### `POST /api/admissions`
Confirms patient arrival and bed admission (`Reserved` → `Occupied`).

### `POST /api/discharges`
Discharges patient and queues bed for sanitization (`Occupied` → `Under Cleaning`).

---

## Traffic Signals & Priorities

### `GET /api/traffic-signals`
Returns all traffic signals with current status (`RED` / `GREEN`) and emergency mode flag.

### `PATCH /api/traffic-signals/:id/override`
Operator manual override for traffic signals.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "current_status": "GREEN",
    "emergency_mode": true
  }
  ```

---

## Bed Cleaning Workflow

### `GET /api/cleaning/beds`
Returns beds requiring sanitization (`Under Cleaning` or `Waiting for Inspection`).

### `POST /api/beds/:id/complete-cleaning`
Marks sanitization complete and returns bed to `Available` status.
