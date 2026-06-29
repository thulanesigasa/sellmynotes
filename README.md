# SellMyNotes.co.za MVP

A peer-to-peer marketplace for South African students to sell and buy notes securely.

## Architecture

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend Microservice**: Python (FastAPI), OpenAI API, PDF compilation
- **Database & Auth**: Supabase (PostgreSQL)
- **Payments**: PayFast

## Local Development

Prerequisites:
- Docker and Docker Compose

To start the local environment:

```bash
docker-compose up --build
```

- Frontend runs at: `http://localhost:3000`
- Backend API docs run at: `http://localhost:8000/docs`
