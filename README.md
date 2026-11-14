# Online Movie Streaming Web Application

A full-stack online movie streaming web application where users can browse, search, and watch movies, manage a personal favorites list, and administrators can manage the movie catalog.

## Team Members

| No. | Name | Student ID |
|---|---|---|
| 1 | นายชินกร เทพพงษ์ประดิษฐ  1 | 660910487 |
| 2 | นายนนนน วาสนานนท์      2 | 660910667 |
| 3 | นายบูรณ์ภัทร์ บุญสูขเกิด    3 | 660910668 |
| 4 | นายสิงหา ฝอยทับทิม      4 | 660911043 |


## Website Preview

![Movie Streaming Website](docs/images/website-preview.png)


> **Scope:** This application streams individual movies only. It does not support multi-episode series or season/episode management.

## Overview

The application provides a public movie catalog with search and filtering, a movie detail page, and a video player that supports both direct video files and YouTube trailers. Registered users can save movies to their favorites. Administrators have a dedicated dashboard to create, edit, and delete movies.

- **Frontend:** React single-page application (SPA) served by Vite.
- **Backend:** RESTful API built with Node.js and Express, secured with JWT.
- **Database:** MySQL.

## Technology Stack

### Frontend
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [JWT](https://www.npmjs.com/package/jsonwebtoken) (authentication)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing)
- [express-validator](https://express-validator.github.io/) (request validation)
- [mysql2](https://www.npmjs.com/package/mysql2) (MySQL driver, promise API)

### Database
- MySQL 8.0+

## Features

- **Authentication:** User registration and login with JWT.
- **Roles:** `user` and `admin` roles.
- **Movie browsing:** Movie list with search by title/description and filters by genre and minimum rating.
- **Movie detail:** Poster, metadata, synopsis, and playback entry point.
- **Movie player:**
  - Direct video URLs (`.mp4`, `.webm`, `.ogg`, `.ogv`, `.mov`, `.m4v`) played with the HTML5 `<video>` element.
  - YouTube URLs (`youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`, `/v/`) embedded via YouTube iframe.
  - Unsupported URLs display an in-page warning.
- **Favorites:** Add or remove movies from the movie list and movie detail pages, and manage them on a dedicated Favorites page.
- **Admin dashboard:** Create, edit, and delete movies.
- **Protected routes:** Dashboard and Favorites require authentication; the Admin dashboard requires an `admin` role.

## Project Structure

```
Online Movie Streaming Web Application/
├── backend/
│   ├── scripts/
│   │   ├── create-tables.js      # Creates the required database tables
│   │   ├── add-video-url.js      # Adds the movies.video_url column if missing
│   │   └── create-admin.js       # Interactive admin account creation
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── favoriteController.js
│   │   │   └── movieController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   ├── Favorite.js
│   │   │   ├── Movie.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── categories.js
│   │   │   ├── favorites.js
│   │   │   └── movies.js
│   │   └── server.js
│   ├── crud-test.js              # Ad-hoc CRUD check script (not part of setup)
│   ├── package.json
│   └── .env                      # Local environment file (not committed)
├── frontend/
│   ├── public/
│   │   └── images/
│   │       └── movie-background.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FavoritesContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MovieDetail.jsx
│   │   │   ├── MovieList.jsx
│   │   │   ├── MoviePlayer.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/                     # Currently empty
├── docs/                         # Currently empty
├── .gitignore
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js 18 or later
- npm (or yarn)
- MySQL 8.0+ running locally

## Installation & Setup

### 1. Create the database

The setup scripts connect to an existing database; they do not create it. Create the database first:

```sql
CREATE DATABASE IF NOT EXISTS movie_streaming
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. Configure the backend environment

Create `backend/.env` (this file is git-ignored and must not be committed):

```ini
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=movie_streaming

# Authentication
JWT_SECRET=your_long_random_jwt_secret

# Optional: set to "development" to include error details in API responses
NODE_ENV=development
```

> `JWT_SECRET` must be a long, random value. Never commit the real `.env` file.

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Create the database tables

From the `backend` directory:

```bash
node scripts/create-tables.js
```

This creates the `users`, `movies`, `categories`, `movie_categories`, and `favorites` tables.

### 5. Add the `video_url` column

The base table script does not include `movies.video_url`, which is required for playback. Add it if missing:

```bash
node scripts/add-video-url.js
```

The script is idempotent; it reports that the column already exists if it has been added.

### 6. Create an admin account (optional but required for the Admin dashboard)

```bash
node scripts/create-admin.js
```

The script prompts for an admin email, name, and password (minimum 6 characters), then creates a user with the `admin` role. Registration through the API always creates users with the `user` role.

### 7. Configure the frontend environment (optional)

`frontend/.env` is optional:

```ini
VITE_API_URL=http://localhost:5000
```

When `VITE_API_URL` is not set, the frontend calls same-origin `/api` paths and relies on the Vite development proxy (configured in `vite.config.js`) to forward requests to `http://localhost:5000`.

## Running the Project

### Backend

```bash
cd backend
npm run dev
```

Runs the API with `nodemon` on `http://localhost:5000` by default. Use `npm start` to run it without auto-reload.

### Frontend

```bash
cd frontend
npm run dev
```

Starts the Vite development server on `http://localhost:5173`.

### Build the frontend

```bash
cd frontend
npm run build
```

Outputs the production bundle to `frontend/dist/`. Preview the build locally with `npm run preview`.

## API Documentation

**Base URL:** `http://localhost:5000`

**Authentication:** Protected endpoints require the header `Authorization: Bearer <token>`.

**Response format:**

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Error description" }
```

### Authentication

| Method | Endpoint | Auth | Description | Request Body |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register a new user (role `user`). Returns the user ID, email, and JWT. | `name`, `email`, `password` |
| `POST` | `/api/auth/login` | Public | Authenticate and return the user ID, email, role, and JWT. | `email`, `password` |

### Movies

| Method | Endpoint | Auth | Description | Query / Body |
| --- | --- | --- | --- | --- |
| `GET` | `/api/movies` | Public | List movies. | Query: `genre`, `search`, `min_rating` |
| `GET` | `/api/movies/:id` | Public | Get a single movie by ID. | — |
| `POST` | `/api/movies` | **Admin** | Create a movie. | Body below |
| `PUT` | `/api/movies/:id` | **Admin** | Update a movie. | Body below |
| `DELETE` | `/api/movies/:id` | **Admin** | Delete a movie. | — |

**Create / update body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | Yes | 1–255 characters |
| `description` | string | No | Up to 2000 characters |
| `genre` | string | No | Up to 100 characters |
| `duration` | integer | No | Minutes, minimum 1 |
| `release_year` | integer | No | Between 1900 and 2099 |
| `poster_url` | string (URL) | No | Must be a valid URL |
| `video_url` | string | No | Direct video URL or YouTube URL |
| `rating` | number | No | Between 0 and 10 |

### Categories

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Public | List all categories. |
| `GET` | `/api/categories/:id` | Public | Get a category by ID. |
| `GET` | `/api/categories/:id/movies` | Public | List movies linked to a category. |

### Favorites

All favorites endpoints require authentication.

| Method | Endpoint | Auth | Description | Request Body |
| --- | --- | --- | --- | --- |
| `GET` | `/api/favorites` | User | List the current user's favorites (joined with movie data). | — |
| `POST` | `/api/favorites` | User | Add a movie to favorites. | `movie_id` |
| `DELETE` | `/api/favorites/:movie_id` | User | Remove a favorite by movie ID. | — |
| `DELETE` | `/api/favorites/id/:id` | User | Remove a favorite by favorite-record ID. | — |

### System

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Server health check. |
| `GET` | `/api/db-health` | Public | Database connection check. |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port (defaults to `5000`). |
| `DB_HOST` | Yes | MySQL host. |
| `DB_PORT` | Yes | MySQL port. |
| `DB_USER` | Yes | MySQL user. |
| `DB_PASSWORD` | Yes | MySQL password. |
| `DB_NAME` | Yes | Database name. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. |
| `NODE_ENV` | No | When set to `development`, API error responses include error details. |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Base URL for API requests. Defaults to same-origin `/api` (Vite proxy). |
