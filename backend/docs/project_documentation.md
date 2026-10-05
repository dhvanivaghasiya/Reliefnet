# ReliefNet Project Architecture & Design Documentation

## 1. System Architecture Design

ReliefNet consists of a decoupled Client-Server architecture:

- **React Frontend**: Port 5173. Operates as a Single Page Application (SPA). Connects to endpoints over HTTP. Utilizes Axios with interceptor layers to auto-refresh JWT access tokens.
- **Django REST Framework Backend**: Port 8000. Handles ORM serialization, query validations, API views, permissions controls, CORS configurations, and automated notification triggers.
- **PostgreSQL Database**: Relational schema mapping base tables, campaigns, camps, inventory, donation offers, and activity notifications.

---

## 2. Dynamic Operations & Business Rules

### A. Automatic Inventory Increments via Donations
- When a donation is logged, it starts in a `PENDING` state.
- Once a Camp Leader or Super Admin changes the Donation status to `COMPLETED`, a database transaction triggers:
  - It searches the `InventoryItem` table in the targeted camp matching the donation's product category and product name.
  - If a matching item is found, the quantity is automatically increased by the donated quantity.
  - If not found, a new `InventoryItem` is dynamically initialized in the inventory database with the category, product name, quantity, and unit.

### B. Role-Based Permissions & Guard Rules
- **Guest / Anonymous**: Can submit donation offers, volunteer applications, and camp leader applications. Can view campaigns and camps list.
- **Volunteer**: Authenticated profile. Can view active camps, notifications assigned to them, and campaign list.
- **Camp Leader**: Authenticated manager profile. Can create, edit, or delete inventory logs in camps they lead. Can view donation history for items designated for their camps.
- **Super Admin**: Full backend and frontend administrative controls. Can approve/reject application forms, deploy volunteers, CRUD campaigns, modify camps, and manage system categories.

---

## 3. Security & Validation Practices

- **JWT Authentication**: Incorporates `SimpleJWT` for authentication. Expired access tokens trigger automatic silent refreshes via the axios response interceptor.
- **Route Guards**: Evaluated before rendering components. Unauthenticated requests are immediately redirected back to `/login`.
- **Coordinate Checks**: All camps validate location parameters (lat/lng range) to ensure accurate placement on maps.
- **No Negative Values**: Capacity and inventory quantity entries prevent negative values.
