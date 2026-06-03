# ♻️ Trashformers — Smart Waste Trade Platform

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)

> **Smart Waste Trade Platform for Sustainable Urban Waste Management**
> A production-grade, full-stack, mobile-first marketplace connecting waste generators directly with local recyclers, scrap dealers, and repurposing industries to keep recyclables out of landfills.

---

## 📐 System Architecture & Flow

```mermaid
graph TD
    subgraph MobileClient [React Native Expo Mobile Client]
        UI[StyleSheet / UI Screens]
        AuthCtx[AuthContext / Token Manager]
        Axios[Axios Client with Auto-Refresh Interceptors]
        MapsUI[React Native Maps Provider]
    end

    subgraph ExternalServices [External Integrations]
        GMaps[Google Maps Geocoding API]
    end

    subgraph CloudBackend [Render Web Service]
        Gunicorn[Gunicorn WSGI Server]
        Django[Django REST Framework Engine]
        WhiteNoise[WhiteNoise Static Middleware]
    end

    subgraph DataStore [Neon Serverless Cluster]
        PG[PostgreSQL Database]
    end

    UI --> AuthCtx
    AuthCtx --> Axios
    Axios -->|HTTPS / JWT Auth| Gunicorn
    Gunicorn --> Django
    Django -->|ORM Queries| PG
    Django -->|Address to Coord Geocoding| GMaps
    RNMaps[MapsUI] -.->|Display Markers & Paths| GMaps
    Django -->|Serve Compressed Assets| WhiteNoise
```

---

## 🛠️ Detailed Technical Stack Specifications

### 1. Mobile Client (React Native + TypeScript + Expo)
* **Architecture:** Modular component-based layout with clean separation of services, hooks, and context.
* **Navigation:** Nested navigator hierarchy using `@react-navigation/native`. Incorporates `BottomTabNavigator` for primary sections and `NativeStackNavigator` for detail/auth paths.
* **Authentication State Management:** Implemented custom React `AuthContext` to manage user sessions globally. Includes persistent storage integration with `@react-native-async-storage/async-storage`.
* **API Networking & Token Handlers:** Built an `Axios` instance equipped with:
  * **Request Interceptor:** Dynamically attaches active JWT Bearer tokens to the `Authorization` header.
  * **Response Interceptor:** Automatically intercepts `401 Unauthorized` responses, triggers a background Token Refresh API call using the stored refresh token, updates the access token, and retries the original request seamlessly.
* **Maps & Geolocation:** Utilizes `react-native-maps` for visual marker selection, coordinates projection, and offline navigation mapping using native Google Play services.

### 2. API Backend (Django + Django REST Framework)
* **REST Engine:** Built upon Django's Model-View-Controller framework, exposing pure JSON endpoints via Django REST Framework (DRF) generic API views.
* **Custom Authentication:** Token-based security using `django-rest-framework-simplejwt`. Configured with token rotation (a new refresh token is issued on each refresh call) and strict token blacklisting to secure logouts.
* **Geographical Computations:** Integrates Google Geocoding API dynamically. When a seller lists a waste item with an address but no coordinates, the backend geocodes the address into latitude/longitude on save.
* **Static Assets Delivery:** Integrates `whitenoise` middleware. During cloud builds, it runs `collectstatic` to package, compress, and cache static files directly through the WSGI layer, eliminating the need for a separate Nginx config.

### 3. Serverless Database (PostgreSQL + Neon.tech)
* **Relational Schema Design:** Utilizes a highly normalized database layout enforcing strong relational constraints, composite indices on listing searches, and transactions on orders.
* **Custom Auth Model:** Overrides Django's base user model with a custom `User` table (inheriting `AbstractUser`) to support dual-role configurations (`is_buyer`, `is_seller`), telephone validation, ratings, and location coordinates.
* **Precision Datatypes:** Coordinates are stored as `DecimalField(max_digits=9, decimal_places=6)` to maintain sub-meter precision in geographic calculations.

---

## 🔬 Core Algorithms & Database Schemas

### 1. The Haversine Formula (Location-Aware Discovery)
To sort listings by physical proximity and calculate transport distances without heavy GIS database engines like PostGIS, Trashformers implements the **Haversine formula** directly in SQL/Python query-sets and client-side calculators. 

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

Where:
* $\phi_1, \phi_2$ = latitudes of user and listing (in radians)
* $\Delta \phi, \Delta \lambda$ = differences in latitude and longitude
* $R$ = Earth's mean radius ($6371\text{ km}$)

*Implementation snippet:*
```python
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

### 2. Database Schema (Entity-Relationship Diagram)

```mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
        string phone
        decimal latitude
        decimal longitude
        boolean is_buyer
        boolean is_seller
        decimal rating
    }
    
    CATEGORY {
        int id PK
        string name
        string description
        string icon
    }
    
    WASTE_LISTING {
        int id PK
        int seller_id FK
        int category_id FK
        string title
        text description
        decimal quantity
        string unit
        decimal price_per_unit
        string status
        decimal latitude
        decimal longitude
        string address
        datetime created_at
    }

    ORDER {
        int id PK
        int buyer_id FK
        int seller_id FK
        int listing_id FK
        decimal quantity_ordered
        decimal total_price
        string status
        string pickup_address
        date pickup_date
        text pickup_notes
        datetime created_at
    }

    REVIEW {
        int id PK
        int order_id FK
        int reviewer_id FK
        int reviewee_id FK
        int rating
        text comment
        datetime created_at
    }

    CHAT_CONVERSATION {
        int id PK
        int participant_one_id FK
        int participant_two_id FK
        int listing_id FK
        datetime created_at
        datetime updated_at
    }

    CHAT_MESSAGE {
        int id PK
        int conversation_id FK
        int sender_id FK
        text content
        boolean is_read
        datetime created_at
    }

    COMPLAINT {
        int id PK
        int filed_by_id FK
        int reported_user_id FK
        int listing_id FK
        string complaint_type
        text description
        string status
        datetime created_at
    }

    USER ||--o{ WASTE_LISTING : "creates"
    CATEGORY ||--o{ WASTE_LISTING : "categorizes"
    USER ||--o{ ORDER : "places (buyer)"
    USER ||--o{ ORDER : "receives (seller)"
    WASTE_LISTING ||--o{ ORDER : "ordered from"
    ORDER ||--|| REVIEW : "generates"
    USER ||--o{ REVIEW : "gives"
    USER ||--o{ REVIEW : "receives"
    USER ||--o{ CHAT_CONVERSATION : "participates"
    WASTE_LISTING ||--o{ CHAT_CONVERSATION : "associated with"
    CHAT_CONVERSATION ||--o{ CHAT_MESSAGE : "contains"
    USER ||--o{ CHAT_MESSAGE : "sends"
    USER ||--o{ COMPLAINT : "files"
    USER ||--o{ COMPLAINT : "reported"
    WASTE_LISTING ||--o{ COMPLAINT : "flagged"
```

---

## 📡 API Contract Specification

All API endpoints return standardized JSON payloads. Standard pagination returns list endpoints wrapped inside a count and results block.

| Method | Endpoint | Authentication | Request Payload (JSON) | Success Code | Response Sample |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register/` | Public | `{username, email, password, password2, phone}` | `201` | `{message, user: {...}, tokens: {access, refresh}}` |
| **POST** | `/api/auth/login/` | Public | `{username, password}` | `200` | `{message, user: {...}, tokens: {access, refresh}}` |
| **PUT** | `/api/auth/profile/` | JWT Bearer | `{latitude, longitude, is_buyer, bio}` | `200` | `{message, user: {...}}` |
| **GET** | `/api/listings/` | JWT Bearer | Query params: `?category=plastic&sort=distance&latitude=12.9&longitude=77.5` | `200` | `{count, page, results: [...]}` |
| **POST** | `/api/listings/` | JWT Bearer (Seller) | `{title, description, category, quantity, unit, price_per_unit, address}` | `201` | `{id, title, distance_km, total_price, ...}` |
| **POST** | `/api/orders/create/` | JWT Bearer (Buyer) | `{listing_id, quantity_ordered, pickup_date}` | `201` | `{id, total_price, status: "pending", ...}` |
| **PATCH**| `/api/orders/{id}/` | JWT Bearer | `{status: "accepted" \| "completed"}` | `200` | `{message, order: {...}}` |
| **POST** | `/api/chat/send/` | JWT Bearer | `{recipient_id, content}` | `201` | `{id, conversation, sender: {...}, content, is_read}` |
| **GET** | `/api/chat/conversations/`| JWT Bearer | None | `200` | `{count, results: [{id, other_user: {...}, unread_count}]}` |
| **POST** | `/api/reviews/` | JWT Bearer | `{order: id, rating: 5, comment}` | `201` | `{id, rating, reviewee_username}` |
| **POST** | `/api/complaints/` | JWT Bearer | `{reported_user, listing, complaint_type, description}` | `201` | `{id, complaint_type, status: "open"}` |

---

## 🔒 Production Hardening & Cloud Configurations

### 1. Render Web Service Custom Setup
In order to run the Django project on **Render** (Free Web Service tier) securely and without local system dependencies, the build uses the following setup:
* **Gunicorn Server:** Bypasses Django's standard single-threaded development server by running a multi-threaded Gunicorn worker pool:
  `gunicorn config.wsgi:application`
* **Static Asset serving via WhiteNoise:** Embedded in `settings.py` directly under SecurityMiddleware:
  ```python
  MIDDLEWARE = [
      ...
      'django.middleware.security.SecurityMiddleware',
      'whitenoise.middleware.WhiteNoiseMiddleware',
      ...
  ]
  ```
  And configured to cache and gzip compiled static assets automatically:
  ```python
  STORAGES = {
      "default": {
          "BACKEND": "django.core.files.storage.FileSystemStorage",
      },
      "staticfiles": {
          "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
      },
  }
  ```

### 2. Environment Variables Configuration
The system dynamically configures itself on boot using environment variables parsed by `python-decouple` and `dj-database-url`:
* `DEBUG`: Set to `False` in production to prevent traceback leaks.
* `DATABASE_URL`: Automatically parses connection details from **Neon Serverless PostgreSQL** database clusters.
* `SECRET_KEY`: Autogenerated cryptographically secure key injected by the PaaS manager.
* `GOOGLE_MAPS_API_KEY`: Injected into the runtime for backend address geocoding.

---

## 🛠️ Installation & Local Deploy Guide

Refer to [README.md](file:///C:/Users/ABHIRAM/.gemini/antigravity/scratch/Trashformers/README.md) or execute:

### 1. Backend Dev Server:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Dev Server:
```bash
cd frontend
npm install
npx expo start --tunnel
```

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
Designed and built for sustainability, circular economy, and smarter waste trading. 🌿
