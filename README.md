# AE Trade Group Knowledge Management System Prototype

## System Architecture

This prototype is built as a full-stack web application with:
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL

Architecture components:
- `frontend/`: React UI, route pages, knowledge search, lessons submission, expert profiles
- `backend/`: REST API routes, JWT auth, PostgreSQL connection, role-based access control
- `sql/schema.sql`: PostgreSQL schema with users, knowledge_items, lessons_learned, comments, ratings

## Database Schema

Key tables:
- `users`: application users with roles, expertise, region, language preference
- `knowledge_items`: repository assets with tags, language, region, status, version control
- `lessons_learned`: tacit knowledge capture entries
- `comments`: discussion comments linked to knowledge objects
- `ratings`: upvotes for knowledge and lessons

## Backend API Endpoints

Implemented REST endpoints:
- `POST /api/auth/login`: user login
- `POST /api/auth/register`: create a prototype account
- `GET /api/knowledge`: search/filter knowledge items
- `GET /api/knowledge/:id`: retrieve one item
- `POST /api/knowledge`: create knowledge entry
- `PUT /api/knowledge/:id`: update knowledge item
- `GET /api/lessons`: list lessons learned
- `POST /api/lessons`: submit a new lesson learned
- `GET /api/users/experts`: browse expert profiles
- `GET /api/users/me`: current user profile

## Frontend Structure

Main files:
- `frontend/src/App.jsx`: app shell, routing, search bar, language toggle
- `frontend/src/components/Sidebar.jsx`: side navigation
- `frontend/src/components/KnowledgeCard.jsx`: knowledge item preview
- `frontend/src/pages/Repository.jsx`: knowledge browsing
- `frontend/src/pages/LessonsLearned.jsx`: lesson capture and list
- `frontend/src/pages/Experts.jsx`: expert directory
- `frontend/src/pages/Discussions.jsx`: discussion placeholder
- `frontend/src/services/api.js`: REST API client
- `frontend/src/i18n.js`: simple English/Amharic toggle

## Getting Started

### Backend

1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create PostgreSQL database and run `sql/schema.sql`
4. Set `DATABASE_URL` and `JWT_SECRET` in `.env`
5. Start server: `npm start`

### Frontend

1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start app: `npm run dev`

## Notes

This prototype focuses on:
- central knowledge repository
- lessons learned capture
- expert lookup
- basic localization support
- role-based permissions for staff, managers, and admins

Future enhancements:
- comment threads and discussion posting
- version history UI
- stronger workflow for manager approval
- richer multilingual content management
