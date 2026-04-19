# Smart File Sharing and Collaboration Platform

Full-stack MERN application for secure file uploads, file management, and public sharing with optional password protection.

## Tech Stack

- Frontend: React, React Router, Axios, React Toastify
- Backend: Node.js, Express, Multer, JWT, bcryptjs
- Database: MongoDB, Mongoose
- and here is the link for live demo https://filen.netlify.app/auth

## Project Architecture

```text
frontend/
  src/
    api/            Axios client and backend connectivity
    components/     Reusable UI blocks
    context/        Authentication state and session logic
    pages/          Auth, dashboard, and public share screens
    routes/         Protected route wrapper
    utils/          Formatting and error helpers

backend/
  src/
    config/         Database connection
    controllers/    Auth, files, and share logic
    middleware/     JWT protection, upload config, error handling
    models/         User and File schemas
    routes/         REST API route modules
  storage/          Local uploaded files
```

## Database Design

### User Schema

- `name`
- `email`
- `password`
- `createdAt`
- `updatedAt`

### File Schema

- `name`
- `originalName`
- `size`
- `path`
- `mimeType`
- `category`
- `owner`
- `isPublic`
- `shareToken`
- `sharePassword`
- `createdAt`
- `updatedAt`

## API Flow

1. A user signs up or logs in from the React client.
2. The backend validates credentials, hashes passwords with `bcryptjs`, and returns a JWT.
3. The frontend stores the token in `localStorage` and sends it in the `Authorization` header.
4. Protected file routes verify the JWT in middleware before continuing.
5. File uploads go through Multer, which stores files inside `backend/storage`.
6. File metadata is saved in MongoDB so the dashboard can list, search, paginate, rename, delete, and share files.
7. Public share links use a unique share token. If a password is configured, the public share page verifies it before exposing download access.

## Frontend and Backend Connection

- The frontend uses Axios through `src/api/client.js`.
- Set `REACT_APP_API_URL` in `frontend/.env` to point at the backend server.
- The backend uses `CLIENT_URL` for CORS and for generating public share links.
- All authenticated requests automatically include the JWT through an Axios interceptor.

## REST API Overview

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Files

- `GET /api/files`
- `POST /api/files/upload`
- `PATCH /api/files/:id/rename`
- `PATCH /api/files/:id/share`
- `GET /api/files/:id/download`
- `DELETE /api/files/:id`

### Public Sharing

- `POST /api/share/:shareToken/access`
- `GET /api/share/:shareToken/download`

## Features Included

- JWT authentication and protected routes
- Password hashing with `bcryptjs`
- File uploads with Multer
- MongoDB metadata storage
- File list, delete, rename, and download
- Shareable public links with optional password protection
- Search, category filtering, and pagination
- Drag and drop upload UI
- Upload progress bar
- Toast notifications
- Responsive dashboard
- Environment-based configuration

## Setup Instructions

### 1. Backend setup

1. Open a terminal in `backend`.
2. Copy `.env.example` to `.env`.
3. Update:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
4. Run `npm install` if dependencies are not already present.
5. Start the API with `npm run dev`.

### 2. Frontend setup

1. Open a terminal in `frontend`.
2. Copy `.env.example` to `.env`.
3. Set `REACT_APP_API_URL=http://localhost:5000`.
4. Run `npm install` if dependencies are not already present.
5. Start the client with `npm start`.

### 3. MongoDB

- Make sure MongoDB is running locally or provide a hosted MongoDB URI.
- Default example database: `smart-file-sharing`.

## Production Build Instructions

### Frontend

1. Run `npm run build` inside `frontend`.
2. Deploy the generated `build/` directory to your preferred static host.

### Backend

1. Set production environment variables on the server.
2. Run `npm start` inside `backend`.
3. Ensure the `storage/` directory is writable.
4. Update `CLIENT_URL` so generated share links point to the deployed frontend.

## Suggested Deployment

### Frontend on Netlify

This repo now includes [netlify.toml](/C:/Uderstanding_mern/netlify.toml) and [frontend/public/_redirects](/C:/Uderstanding_mern/frontend/public/_redirects) so the React app works as a single-page application on Netlify.

Use these settings in Netlify:

- Repository: `Indumathi02-jami/File_sharing_app`
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`
- Environment variable: `REACT_APP_API_URL=https://<your-backend-domain>`

### Backend on Render

Use these settings in Render for the Express API:

- Service type: Web Service
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Set these environment variables in Render:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_URL=https://<your-netlify-site>`
- `MAX_FILE_SIZE=10485760`

## Resume Talking Points

- Implemented secure JWT authentication with password hashing and protected API routes.
- Built a modular Express API with Multer file uploads and MongoDB metadata persistence.
- Added shareable public links with optional password protection.
- Designed a responsive React dashboard with drag-and-drop uploads, progress tracking, filtering, pagination, and toast feedback.
