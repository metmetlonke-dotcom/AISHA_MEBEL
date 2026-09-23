# AISHA MEBEL Digital Commerce System

This is a production-ready system for AISHA MEBEL consisting of:
- FastAPI Backend & REST API
- Aiogram 3 Telegram Bot
- React Web App (Customer)
- React Admin Panel

## Architecture
The system uses PostgreSQL for the database and Redis for caching/rate-limiting.
It follows a clean, modular architecture.

## Requirements
- Docker and Docker Compose
- Node.js >= 20
- Python >= 3.12

## Local Development

### 1. Database & Infrastructure
Start the database and Redis:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate # Windows
# source venv/bin/activate # Linux/Mac
pip install -r requirements.txt

# Run migrations (Ensure DB is running!)
alembic revision --autogenerate -m "Init"
alembic upgrade head

# Start API
uvicorn app.main:app --reload

# Start Bot (in a new terminal)
python -m app.bot.main
```

### 3. Frontend Web App
```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Panel
```bash
cd admin
npm install
npm run dev
```

## Production Deployment (Railway)
The project includes `Dockerfile` for each service and a `railway.toml` for easy deployment on Railway.app.

1. Connect Railway to your repository.
2. Add PostgreSQL and Redis plugins on Railway.
3. Set environment variables.
4. Deploy the backend, frontend, and admin services using their respective Dockerfiles.
