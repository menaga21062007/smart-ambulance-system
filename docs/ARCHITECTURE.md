# System Architecture & Technical Specifications

## 1. System Architecture Overview

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                   React + Vite Frontend                     │
  │  (Ambulance Mobile, Hospital ER, Traffic Ops, Admin, Wards) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ REST API & WebSockets
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 Express + Node.js Backend                   │
  │  (JWT RBAC, Socket.IO Dispatcher, Haversine Engine)        │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
                 ▼                              ▼
  ┌──────────────────────────────┐ ┌───────────────────────────┐
  │     Bed Recommendation       │ │   Traffic Signal Priority │
  │        Scoring Engine        │ │      Proximity Engine     │
  └──────────────────────────────┘ └───────────────────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │
                                ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                   SQLite Relational Database                │
  │                   (19 Tables with Seed Data)                │
  └─────────────────────────────────────────────────────────────┘
```

## 2. Bed Recommendation Scoring Engine
Filters available beds in target hospital and scores them using weighted clinical metrics:

$$\text{Score} = \text{Base}(50) + \text{TriageMatch}(+40) + \text{EquipmentMatch}(+15) + \text{IsolationMatch}(+30) + \text{FloorProximity}(+10)$$

- **Triage Matching**: Critical/Red patients receive maximum priority boost for ICU / Emergency ward beds.
- **Equipment Matching**: Evaluates presence of required medical hardware (Ventilator, Medical Oxygen, Vital Monitors).
- **Isolation Requirement**: Confirms negative-pressure isolation room capability for contagious conditions.

## 3. Traffic Priority Geofence Engine
Calculates real-time Haversine distance between ambulance coordinates $(Lat_{amb}, Lng_{amb})$ and traffic signal coordinates $(Lat_{sig}, Lng_{sig})$:

$$d = 2R \arcsin \left( \sqrt{ \sin^2 \left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cos(\phi_2) \sin^2 \left(\frac{\Delta \lambda}{2}\right) } \right)$$

When $d \le 500\text{m}$, the system automatically emits a `traffic_priority_triggered` event, sets signal status to `GREEN` with `emergency_mode = 1`, and logs a `signal_priority_events` audit record.

## 4. Socket.IO Realtime Events

| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `ambulance_location_feed` | Server → Client | Broadcasts live latitude, longitude, and route trajectory |
| `incoming_emergency_alert` | Server → Client | Alerts ER hospital staff of incoming patient & ETA |
| `traffic_priority_triggered` | Server → Client | Notifies Traffic Control Center of emergency green signal |
| `bed_reserved` | Server → Client | Updates ward matrix in real-time when bed is reserved |
| `resource_alert` | Server → Client | Triggers alert toast when stock drops below safety threshold |
