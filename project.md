# 🟢 Smart Waste Trade Platform

**Complete Project Context & Technical Documentation**

---

## 1. Project Overview

### 1.1 Project Name

**Smart Waste Trade Platform for Sustainable Urban Waste Management**

### 1.2 Problem Statement

Urban waste such as plastics, metals, paper, biodegradable waste, and e-waste often ends up in landfills despite having high recycling or reuse value. There is no structured digital platform that directly connects waste generators with potential buyers or recyclers in a transparent, location-aware, and secure manner.

### 1.3 Solution Overview

The Smart Waste Trade Platform is a **mobile-first marketplace application** that enables individuals, businesses, and industries to:

* Sell segregated waste
* Buy recyclable or reusable waste
* Communicate directly for negotiation and pickup
* Promote sustainable waste management practices

The platform supports **dual-role users**, location-based discovery, ratings, complaints, and secure authentication.

---

## 2. Core Objectives

* Promote waste segregation at source
* Enable reuse and recycling through localized trade
* Reduce landfill waste and transportation emissions
* Provide a transparent and fair waste trading ecosystem
* Encourage responsible waste management via incentives and ratings

---

## 3. Target Users

| User Type          | Description                                |
| ------------------ | ------------------------------------------ |
| Household Users    | Sell biodegradable and recyclable waste    |
| Commercial Units   | Sell bulk waste                            |
| Industrial Sellers | Wholesale waste suppliers                  |
| Buyers             | Recyclers, scrap dealers, reuse industries |
| Admin              | Platform moderator and supervisor          |

---

## 4. Functional Features

### 4.1 User Management

* User registration & login
* JWT-based authentication
* Single account for buyer and seller roles
* Profile management
* Account verification (future scope)

---

### 4.2 Waste Listing Management

* Create waste listings
* Mandatory waste categorization:

  * Plastic
  * Metal
  * Paper
  * Biodegradable
  * E-waste
* Quantity, price, and description
* Upload images (optional)
* Edit / delete listings

---

### 4.3 Buyer Discovery & Search

* Filter by:

  * Waste category
  * Price range
  * Quantity
* Sort by:

  * Price
  * Distance (location-based)
  * Rating
* Nearby sellers prioritization using latitude & longitude

---

### 4.4 Location-Based Recommendations
- Uses google maps api key
* Each listing stores:

  * Latitude
  * Longitude
* Distance calculated using **Haversine formula**
* Reduces transportation cost and carbon emissions

---

### 4.5 Chat & Communication

* REST-based messaging system
* One-to-one buyer-seller chat
* Message history persistence
* Used for:

  * Negotiation
  * Pickup scheduling
  * Clarifications

*(WebSockets deliberately avoided for simplicity)*

---

### 4.6 Orders & Transactions

* Order initiation from listing
* Pickup scheduling
* Payment gateway (mock or future integration)
* Order status:

  * Pending
  * Accepted
  * Completed
  * Cancelled

---

### 4.7 Ratings & Reviews

* Buyer and seller rating system
* Feedback after transaction
* Helps build trust and platform credibility

---

### 4.8 Complaints & Reporting

* Report:

  * False listings
  * Incorrect categorization
  * Poor service
* Admin review and moderation

---

### 4.9 Admin Panel

* Django Admin Interface
* Manage:

  * Users
  * Listings
  * Complaints
  * Transactions
* Suspend or remove users if necessary

---

## 5. Non-Functional Requirements

* Secure authentication
* Scalable REST APIs
* Modular and maintainable codebase
* Fast API response times
* Clean separation of concerns
* Easy onboarding for new developers

---

## 6. Technology Stack

### 6.1 Frontend (Mobile)

* **React Native**
* **TypeScript**
* Component-based UI architecture
* REST API integration

---

### 6.2 Backend

* **Python**
* **Django**
* **Django REST Framework (DRF)**

Responsibilities:

* API development
* Business logic
* Authentication
* Validation
* Database interaction

---

### 6.3 Database

* **PostgreSQL**
* Relational schema design
* ACID compliance
* Efficient indexing for filters and search

---

### 6.4 Authentication

* **JWT (JSON Web Tokens)**
* Access token + refresh token
* Role-based access control

---

### 6.5 Chat System

* REST-based messaging
* Polling from frontend
* Messages stored in database

---

## 7. System Architecture

```
[ React Native App ]
        |
        | REST API (JSON)
        v
[ Django + DRF Backend ]
        |
        v
[ PostgreSQL Database ]
```

---

## 8. Backend Architecture

### 8.1 App Structure

```
backend/
│
├── users/
├── listings/
├── orders/
├── chat/
├── reviews/
├── complaints/
├── core/
└── config/
```

---

### 8.2 Key Django Apps

| App        | Responsibility            |
| ---------- | ------------------------- |
| users      | Authentication & profiles |
| listings   | Waste listings            |
| orders     | Transactions              |
| chat       | Messaging                 |
| reviews    | Ratings                   |
| complaints | Reporting                 |
| core       | Shared utilities          |

---

## 9. Database Design (High-Level)

### 9.1 Core Tables

* User
* Profile
* WasteListing
* Category
* Order
* ChatMessage
* Review
* Complaint

### 9.2 Relationships

* User ↔ Listings (1:N)
* User ↔ Orders (1:N)
* Order ↔ Reviews (1:1)
* Users ↔ ChatMessages (M:N)

---

## 10. API Design Principles

* RESTful endpoints
* Token-based authentication
* Versioned APIs (`/api/v1/`)
* Pagination for listings
* Proper HTTP status codes

---

## 11. Sample API Endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/
GET    /api/listings/
POST   /api/listings/
GET    /api/listings/{id}/
POST   /api/chat/send/
GET    /api/chat/messages/
POST   /api/orders/create/
POST   /api/reviews/
POST   /api/complaints/
```

---

## 12. Development Workflow (Team)

### 12.1 Branching Strategy

* `main` – stable
* `dev` – integration
* `feature/<feature-name>` – individual work

---

### 12.2 Code Standards

* PEP8 for Python
* Meaningful commit messages
* Modular commits
* API documentation updates with changes

---

## 13. Testing Strategy

* Unit tests for models
* API testing using Postman
* Manual UI testing
* Edge case validation

---

## 14. Security Considerations

* JWT token validation
* Password hashing
* Input validation
* Role-based access
* Rate limiting (future scope)

---

## 15. Deployment (Future Scope)

* Backend:

  * Will mention later
* Database:

  * Managed PostgreSQL 
* Frontend:

  * Play Store / APK distribution

---

## 16. Future Enhancements

* WebSockets for real-time chat
* Push notifications
* AI-based price suggestions
* Reward points system
* Environmental impact dashboard
* PostGIS for advanced geo-queries

---

## 17. Why This Stack Was Chosen

* Django provides rapid development and admin control
* DRF simplifies API creation
* PostgreSQL ensures reliability
* React Native allows cross-platform mobile apps
* REST-based chat reduces system complexity

---

## 18. Project Philosophy

> “Build simple, scalable systems that solve real problems and can evolve over time.”

---

## 19. Contributors

* Frontend Team
* Backend Team
* Database & Integration Team

---

## 20. Final Notes

This document acts as the **single source of truth** for the project.
All contributors must refer to this file before implementing or modifying features.
