# ReliefNet API Documentation Catalog

All API endpoints are prefixed with `/api/` and output JSON content. 

---

## 🔒 Authentication & Session Management

### 2. User Sign-In
Authenticates credentials and returns token pairs.
- **Endpoint**: `/api/auth/login/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@reliefnet.org",
      "role": "SUPER_ADMIN",
      "must_change_password": false
    }
  }
  ```

### 3. User Password Update (Force Change)
Updates temporary credentials to active, user-defined passwords.
- **Endpoint**: `/api/auth/change-password/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "new_password": "NewSecretPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "detail": "Password changed successfully."
  }
  ```

### 4. Token Refresh
Retrieves a new access token when expired.
- **Endpoint**: `/api/auth/token/refresh/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "refresh": "eyJhbGciOi..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "eyJhbGciOi..."
  }
  ```

---

## 📋 Campaign & Camp Management

### 1. List / Create Campaigns
- **Endpoint**: `/api/campaigns/`
- **Method**: `GET`, `POST`
- **Query Parameters**:
  - `category`: ID of the classifying category
  - `status`: `ACTIVE`, `COMPLETED`, `CANCELLED`
  - `search`: Searches titles and descriptions
  - `ordering`: `created_at`, `-created_at`, `start_date`, `end_date`
  - `page`: Page index for paginated results (e.g. `?page=1`)
- **Payload (POST)**:
  ```json
  {
    "title": "Flood Relief Guwahati",
    "description": "Distributing aid in Guwahati district.",
    "category": 1,
    "status": "ACTIVE",
    "start_date": "2026-07-11T12:00:00Z",
    "end_date": "2026-08-11T12:00:00Z"
  }
  ```
- **Serializer Validations**:
  - Checks if `start_date` is chronologically before `end_date`.

### 2. List / Create Camps
- **Endpoint**: `/api/camps/`
- **Method**: `GET`, `POST`
- **Query Parameters**:
  - `campaign`: Campaign ID
  - `status`: `ACTIVE`, `INACTIVE`, `FULL`
  - `leader`: Leader ID
  - `ordering`: `name`, `capacity`, `current_population`, `created_at`
- **Payload (POST)**:
  ```json
  {
    "campaign": 1,
    "name": "Guwahati High School Camp",
    "address": "Guwahati Central",
    "latitude": 26.1445,
    "longitude": 91.7362,
    "capacity": 250,
    "status": "ACTIVE"
  }
  ```
- **Serializer Validations**:
  - Checks coordinates constraints (`latitude` [-90, 90], `longitude` [-180, 180]).
  - Prevents negative `capacity` or `current_population`.

### 3. Assign Leader directly to Camp (Auto-generates Credentials)
- **Endpoint**: `/api/camps/<id>/assign-leader/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "full_name": "Camp Leader Name",
    "age": 30,
    "email": "leader@email.com",
    "phone": "9999988888",
    "gov_id": "GOV12345",
    "address": "Camp Area Road"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "username": "camp_guwahati_high_school_camp_01",
    "password": "TemporaryPassword!",
    "leader_id": 12
  }
  ```

---

## 📦 Dynamic Inventory & Stock Management

### 1. List / Create Inventory Item
- **Endpoint**: `/api/inventory/`
- **Method**: `GET`, `POST`
- **Query Parameters**:
  - `camp`: Camp ID (filter item stock by camp location)
  - `category`: Category ID
  - `ordering`: `product_name`, `quantity`, `last_updated`
- **Payload (POST)**:
  ```json
  {
    "camp": 1,
    "category": 2,
    "product_name": "First Aid Kit",
    "quantity": 50,
    "unit": "kits"
  }
  ```
- **Serializer Validations**:
  - Prevents negative `quantity`.

---

## 🤝 Volunteers & Camp Leaders Registries

### 1. Apply to Volunteer
- **Endpoint**: `/api/auth/register/volunteer/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "username": "volunteer_1",
    "password": "volunteer123",
    "full_name": "John Doe",
    "age": 25,
    "email": "john@email.com",
    "phone": "+919876543210",
    "gov_id": "ID992837",
    "address": "Guwahati Street",
    "current_city": "Guwahati",
    "skills": "First Aid, Logistics",
    "availability": "Full Time",
    "reason_for_volunteering": "To help coordinate disaster shelters."
  }
  ```

### 2. Update Application Status (Super Admin only)
- **Endpoint**: `/api/volunteers/<id>/`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "status": "APPROVED",
    "assigned_camp": 1
  }
  ```
  *(Status changes trigger notifications and activate user profile login privileges).*
