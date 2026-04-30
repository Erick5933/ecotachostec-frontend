# EcoTachosTec — Frontend

> Web dashboard for the EcoTachosTec smart waste classification system. Built with React + Vite, providing real-time monitoring of IoT waste bins, AI detection history, interactive maps, and device management for institutional environments.

---

## What it does

This is the administrative and operational web interface for EcoTachosTec. Users can monitor smart waste bins across a campus in real time, visualize AI classifications on an interactive map, manage devices, export detection reports, and configure IoT device behavior — all from a responsive web app.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| HTTP client | Axios (with JWT interceptors) |
| Maps | Leaflet (OpenStreetMap + satellite layers) |
| Forms | React Hook Form + Yup validation |
| Real-time | WebSocket (Django Channels) |
| State | React Context + hooks |
| Styling | CSS Modules / custom design system |
| Build | Vite (Brotli compression, code splitting) |

---

## Key features

**Real-time dashboard**
- Live detection counter and recent activity feed
- Animated map markers that update as classifications occur
- WebSocket connection with intelligent polling fallback

**Interactive map**
- Leaflet-powered map with smart bin markers color-coded by status (active / alert / offline)
- Cluster groups for large deployments
- Click any marker to see fill level, last detection, and quick-edit actions
- Switchable base layers: street map, satellite, topographic

**AI classifier interface**
- Upload or capture an image to classify waste
- Visual result: category + confidence bar (green >90%, yellow 70–90%, red <70%)
- Detection history gallery with multi-filter: date range, category, confidence, device

**Device management**
- Full CRUD for smart bins with GPS coordinate picker on map
- Hierarchical location selector (province → city → canton → facility)
- Role-based UI — admin sees all controls, operators see read-only views

**Reports & export**
- Export detections to CSV or XLSX with column selector and active filters applied
- Async export for large datasets (>10,000 records) with progress notification

---

## Getting started

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8000` (see [ecotachostec-backend](https://github.com/Erick5933/ecotachostec-backend))

### Run locally

```bash
git clone https://github.com/Erick5933/ecotachostec-frontend
cd ecotachostec-frontend

npm install

# Set backend URL
cp .env.example .env
# Edit .env → VITE_API_URL=http://localhost:8000/api

npm run dev
```

App runs at `http://localhost:5173`

### Build for production

```bash
npm run build
# Output in /dist — serve with Nginx or any static host
```

---

## Project structure

```
src/
├── api/
│   ├── axiosConfig.js     # Axios instance with JWT interceptors
│   ├── tachoApi.js        # Device CRUD calls
│   ├── authApi.js         # Login, register, Google auth, password reset
│   └── deteccionApi.js    # Detection history and AI prediction calls
├── components/
│   ├── Map/               # Leaflet map component with clustering
│   ├── Classifier/        # AI image upload + result display
│   ├── Dashboard/         # Stats widgets and live feed
│   └── Devices/           # Device management forms and table
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Tachos.jsx         # Smart bin management
│   ├── Clasificaciones.jsx
│   └── Mapa.jsx
└── hooks/                 # useWebSocket, useDetections, useAuth
```

---

## Authentication flow

- JWT stored in localStorage
- Axios interceptor automatically attaches `Bearer` token to every request
- Google OAuth login supported
- Password reset via email link

---

## Performance

- Initial bundle: 1.8MB (reduced from 4.2MB via code splitting)
- Time to Interactive: 1.5s
- Lighthouse score: Performance 91, Accessibility 95, Best Practices 97
- Virtual scrolling for detection tables with 10,000+ records
- WCAG 2.1 AA compliant

---

## Screenshots

| Dashboard | Map | Classifier |
|---|---|---|
| Stats overview, live feed | Interactive bin map | Upload → AI result |

*(See `/docs/screenshots` for full UI walkthrough)*

---

## Related repositories

- [ecotachostec-backend](https://github.com/Erick5933/ecotachostec-backend) — Django REST API + YOLOv8 inference
- [ecotachostec-mobile](https://github.com/Erick5933/ecotachostec-mobile) — React Native mobile app

---

## Authors

Built by Erick Chacón & Edwin Choez, Ecuador (2025–2026)
