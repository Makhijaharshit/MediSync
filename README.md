# MedSync — Longitudinal Health Intelligence Platform

AI-assisted healthcare data extraction, multi-source record synthesis, human-in-the-loop verification, and real-time emergency dispatch response platform for Smart India Hackathon (SIH).

---

## 🚀 Phase 2 Real Authentication & PostgreSQL Architecture

- **PostgreSQL Source of Truth**: All CRUD operations, clinical documents, entities, emergency cards, and audit logs are persisted directly in PostgreSQL (`postgresql+psycopg2://medsync:changeme@localhost:5432/medsync`).
- **Real Authentication & JWT**:
  - Secure bcrypt password hashing with unique salt per user.
  - JWT access tokens with claims and expiration.
  - Session persistence via `localStorage` and `SameSite` cookies.
- **Protected Routes & Middleware**:
  - Next.js Edge Middleware (`middleware.ts`) guards `/dashboard`, `/documents`, `/timeline`, `/emergency`, `/doctor`, `/paramedic`, and `/audit`.
  - Unauthenticated requests are immediately redirected to `/login`.
- **Zero Mock Data Policy**:
  - Removed all hardcoded demo patients and fake clinical arrays.
  - Only a single administrative account is seeded via `backend/app/db/seed.py`.
  - Removed role selector buttons; real users register and authenticate through `/login`.

---

## 🛠 Database Tables in PostgreSQL

1. **`users`**: UUID primary key, email (unique), password_hash (bcrypt), full_name, role (`patient`, `doctor`, `paramedic`, `admin`), created_at.
2. **`patients`**: user_id (FK to users), blood_group, dob, phone, emergency_contacts, allergies, chronic_conditions, notes.
3. **`medical_documents`**: patient_id (FK to users), title, filename, file_path, file_type, file_size, ocr_text, status (`pending`, `processing`, `unverified`, `verified`).
4. **`medical_entities`**: patient_id, document_id, type (`diagnosis`, `medication`, `allergy`, `procedure`, `doctor_note`), value, details, confidence, verified.
5. **`timeline_events`**: patient_id, event_type, title, description, event_date, source_id, verified.
6. **`emergency_profiles`**: patient_id, blood_group, allergies, chronic_conditions, notes.
7. **`emergency_contacts`**: patient_id, name, phone, relation.
8. **`emergency_events`**: patient_id, status (`active`, `resolved`), latitude, longitude, location_name, notes, triggered_at, resolved_at.
9. **`audit_logs`**: actor_id, actor_email, action, details, ip_address, timestamp.

---

## ⚡ Quick Start

### 1. Launch Services
```bash
./start_dev.sh
```
This script terminates any dangling processes on ports 3000 and 8001, launches the FastAPI backend and Next.js frontend, redirects logs to `backend.log` and `frontend.log`, and establishes a cleanup trap upon exit.

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8001](http://localhost:8001)
- **Swagger API Docs**: [http://localhost:8001/api/docs](http://localhost:8001/api/docs)

---

## 👤 Seeded Administrative Credentials

The database contains only one pre-seeded account generated through `backend/app/db/seed.py`:

- **Email**: `admin@medsync.io`
- **Password**: `password123`
- **Role**: `admin`

All other users (patients, clinicians, emergency responders) register through the **`/login`** page.

---

## 🧪 Automated Testing

Execute the test suite against the live authentication and PostgreSQL layer:
```bash
PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_api.py -v
```
All integration tests pass verifying:
- Admin login with bcrypt hash verification
- Real patient registration and automated `patients` profile creation
- Invalid password rejection (401)
- Protected `/auth/me` Bearer token resolution
- Emergency profile mutation and retrieval
- Clinician registration and authorized patient listing
