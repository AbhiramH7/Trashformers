# 🟢 Trashformers

**Smart Waste Trade Platform** — A mobile-first marketplace connecting waste generators with recyclers and scrap dealers.

---

## 📁 Project Structure

```
Trashformers/
├── backend/               # Django + DRF API
│   ├── config/            # Project settings & root URLs
│   ├── users/             # Auth & user profiles
│   ├── listings/          # Waste listings
│   ├── orders/            # Transactions & orders
│   ├── chat/              # Buyer-seller messaging
│   ├── reviews/           # Ratings & reviews
│   ├── complaints/        # Reporting system
│   ├── core/              # Shared utilities
│   ├── requirements.txt   # Python dependencies
│   └── manage.py
├── frontend/              # React Native (Expo) app
├── project.md             # Full technical specification
└── .gitignore
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React Native + TypeScript (Expo)    |
| Backend    | Python + Django + DRF               |
| Database   | PostgreSQL                          |
| Auth       | JWT (SimpleJWT)                     |
| Maps       | Google Maps API                     |

---

## 🚀 Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure .env
cp .env.example .env
# Edit .env with your DB credentials

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start development server
python manage.py runserver
```

---

## 📱 Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login & get JWT |
| POST | `/api/auth/token/refresh/` | Refresh JWT |
| GET/POST | `/api/listings/` | Browse/create listings |
| GET/PUT/DELETE | `/api/listings/{id}/` | Manage listing |
| POST | `/api/orders/create/` | Create order |
| GET/PATCH | `/api/orders/{id}/` | View/update order |
| POST | `/api/chat/send/` | Send message |
| GET | `/api/chat/messages/` | Get chat history |
| POST | `/api/reviews/` | Post review |
| POST | `/api/complaints/` | File complaint |

---

## 🌿 Branching Strategy

- `main` — stable, production-ready
- `dev` — integration branch
- `feature/<name>` — individual features

---

## 📄 License

This project is for educational and sustainability purposes.
