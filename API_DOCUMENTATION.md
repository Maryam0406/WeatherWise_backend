# WeatherWise API Documentation

Base URL (local development): `http://localhost:5000`

## Authentication
Protected endpoints require a JWT sent in the `Authorization` header:

Tokens are obtained from `/api/auth/signup` or `/api/auth/login` and expire after 7 days.

---

## Auth

### POST /api/auth/signup
Create a new user account.

**Auth required:** No

**Request body:**
```json
{
  "name": "Maryam",
  "email": "maryam@example.com",
  "password": "yourpassword",
  "role": "user"
}
```
`role` is optional; defaults to `"user"`. Valid values: `"user"`, `"admin"`.

**Success response — `201 Created`:**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Maryam", "email": "maryam@example.com", "role": "user" }
}
```

**Error responses:**
- `400` — missing required field
- `409` — email already registered

---

### POST /api/auth/login
Log in with existing credentials.

**Auth required:** No

**Request body:**
```json
{ "email": "maryam@example.com", "password": "yourpassword" }
```

**Success response — `200 OK`:** same shape as signup.

**Error responses:**
- `400` — missing email or password
- `401` — invalid email or password

---

## Saved Locations

### GET /api/locations
List all saved locations belonging to the logged-in user.

**Auth required:** Yes

**Success response — `200 OK`:**
```json
[
  { "id": 1, "userId": 1, "label": "Home", "cityName": "Colombo", "latitude": "6.9271", "longitude": "79.8612" }
]
```

---

### POST /api/locations
Create a new saved location.

**Auth required:** Yes

**Request body:**
```json
{ "label": "Home", "cityName": "Colombo", "latitude": 6.9271, "longitude": 79.8612 }
```

**Success response — `201 Created`:** the created location object.

**Error responses:**
- `400` — missing required field

---

### PUT /api/locations/:id
Update a saved location. Only fields you send are updated.

**Auth required:** Yes

**Request body (any subset):**
```json
{ "label": "New label" }
```

**Success response — `200 OK`:** the updated location object.

**Error responses:**
- `404` — location not found, or not owned by this user

---

### DELETE /api/locations/:id
Delete a saved location.

**Auth required:** Yes

**Success response:** `204 No Content`

**Error responses:**
- `404` — location not found
- `409` — location is linked to one or more existing trips and cannot be deleted

---

## Trips

### GET /api/trips
List all trips belonging to the logged-in user, each including nested `packingItems` and `activities`.

**Auth required:** Yes

---

### GET /api/trips/:id
Get one trip, including nested `packingItems`, `activities`, and `location`.

**Auth required:** Yes

**Error responses:**
- `404` — trip not found

---

### POST /api/trips
Create a new trip. Automatically fetches a forecast and generates suggested packing items.

**Auth required:** Yes

**Request body:**
```json
{
  "name": "Weekend in Kandy",
  "locationId": 1,
  "startDate": "2026-08-22",
  "endDate": "2026-08-24",
  "notes": "Visit the temple"
}
```

**Success response — `201 Created`:** the created trip, including auto-generated `packingItems`.

**Error responses:**
- `400` — missing required field, or `endDate` before `startDate`

---

### PUT /api/trips/:id
Update trip details (name, dates, notes).

**Auth required:** Yes

**Error responses:**
- `404` — trip not found

---

### DELETE /api/trips/:id
Delete a trip. Cascades — its packing items and activities are automatically deleted too.

**Auth required:** Yes

**Success response:** `204 No Content`

---

## Packing Items

### POST /api/packing-items/:tripId
Add a new packing item to a trip.

**Auth required:** Yes

**Request body:**
```json
{ "itemName": "Sunglasses" }
```

**Success response — `201 Created`:** the created item.

---

### PUT /api/packing-items/:id
Update a packing item (e.g. toggle packed status).

**Auth required:** Yes

**Request body:**
```json
{ "isPacked": true }
```

---

### DELETE /api/packing-items/:id
Remove a packing item.

**Auth required:** Yes

**Success response:** `204 No Content`

---

## Activities

### POST /api/activities/:tripId
Add a new activity to a trip.

**Auth required:** Yes

**Request body:**
```json
{ "activityName": "Temple visit", "scheduledDate": "2026-08-23T09:00:00" }
```

**Success response — `201 Created`:** the created activity.

---

### DELETE /api/activities/:id
Remove an activity.

**Auth required:** Yes

**Success response:** `204 No Content`

---

## Admin

All routes below require the logged-in user to have `role: "admin"`, in addition to being authenticated.

### GET /api/admin/users
List all users in the system.

**Auth required:** Yes (admin only)

---

### DELETE /api/admin/trips/:id
Delete any trip, regardless of owner (content moderation).

**Auth required:** Yes (admin only)

**Success response:** `204 No Content`

---

## Standard Error Response Shape
All error responses follow this shape:
```json
{ "error": "A human-readable description of what went wrong." }
```

## HTTP Status Codes Used
| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no content to return (typically after delete) |
| 400 | Bad request — missing or invalid input |
| 401 | Unauthorized — missing, invalid, or expired token |
| 403 | Forbidden — authenticated, but lacking required role |
| 404 | Resource not found |
| 409 | Conflict — e.g. duplicate email, or deletion blocked by a dependent record |
| 500 | Unexpected server error |