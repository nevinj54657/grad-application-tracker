# Application Tracker

A full-stack web application for tracking job, internship, placement and
graduate applications — from a saved job listing, through the application
process, to interviews and an offer (or rejection). Built as a portfolio
project to demonstrate full-stack development, REST API design, relational
database modelling, authentication and basic web security.

## Description

Application Tracker helps you keep a single, organised record of your job
search instead of spreading it across spreadsheets, emails and browser
bookmarks. You can save interesting job listings, convert them into
applications once you apply, track each application's status as it moves
through your pipeline, log interviews, keep notes, and see everything that
matters — deadlines, interviews, progress — on one dashboard.

Each user's data is completely private: every request is checked on the
backend to make sure you can only ever see and modify your own saved jobs,
applications, interviews and tags.

## Features

- User registration and login with hashed passwords and session-based auth
- Dashboard with live counts by status, upcoming deadlines and upcoming interviews
- Saved Jobs: add, edit, delete, search, filter, and convert into an application
- Applications: full CRUD with company, role, location, salary, deadline, notes
- Two application views: a sortable table and a Kanban board grouped by status
- Automatic status history — every status change is recorded with a timestamp
- Interviews: schedule per application (type, date/time, location, meeting link,
  outcome), plus a combined upcoming/past view across all applications
- Tags: create your own tags and assign several to any application
- Search applications and saved jobs by company/title/location, filter by
  status, employment type or tag, and sort by deadline or date
- Form validation with inline error messages, loading states and success
  feedback on every create/update/delete action
- Responsive layout that works on mobile, tablet and desktop
- Backend security: bcrypt password hashing, HTTP-only session cookies,
  Helmet security headers, CORS, rate limiting on login, and ownership
  checks on every data-access endpoint

## Technologies

**Frontend:** React, Vite, React Router, Tailwind CSS
**Backend:** Node.js, Express.js, express-session, bcrypt, Helmet, CORS,
express-rate-limit
**Database:** MariaDB / MySQL with Prisma ORM
**Testing:** Jest, Supertest

## Requirements

- [Node.js](https://nodejs.org/) v18 or later (and npm)
- A local MariaDB or MySQL server (v10.x MariaDB or MySQL 8+). No Docker or
  XAMPP required — any MySQL-compatible server works, including one you
  already run through XAMPP if you prefer.

## Installation

```bash
git clone <this-repository-url>
cd application-tracker

# Install dependencies for the root, server and client
npm run install:all
```

## Database setup

1. Make sure your local MariaDB/MySQL server is running.
2. Create a database and a user for the app (adjust the password):

   ```sql
   CREATE DATABASE application_tracker;
   CREATE USER 'apptracker'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON application_tracker.* TO 'apptracker'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Copy the environment file and fill in your database credentials:

   ```bash
   cp .env.example server/.env
   ```

   Edit `server/.env` and set `DATABASE_URL` to match the database/user you
   just created, e.g.:

   ```
   DATABASE_URL="mysql://apptracker:your_password_here@localhost:3306/application_tracker"
   ```

4. Run the Prisma migrations to create all the tables:

   ```bash
   cd server
   npx prisma migrate dev
   ```

## Running the application

From the project root, with your database running:

```bash
npm run dev
```

This starts the Express API (default `http://localhost:5000`) and the Vite
dev server (`http://localhost:5173`) together. Open
`http://localhost:5173` in your browser, register an account, and start
tracking applications.

You can also run each side individually:

```bash
npm run dev:server   # API only
npm run dev:client   # frontend only
```

### Running the backend tests

Tests run against a separate `application_tracker_test` database so they
never touch your development data:

```sql
CREATE DATABASE application_tracker_test;
GRANT ALL PRIVILEGES ON application_tracker_test.* TO 'apptracker'@'localhost';
```

Then, from `server/`, adjust `.env.test` if needed and run:

```bash
npm test
```

## Environment variables

Configured in `server/.env` (copy `.env.example` to get started):

| Variable        | Description                                          |
| --------------- | ----------------------------------------------------- |
| `DATABASE_URL`  | MySQL/MariaDB connection string used by Prisma        |
| `SESSION_SECRET`| Long random string used to sign session cookies       |
| `PORT`          | Port the Express API listens on (default `5000`)      |
| `CLIENT_URL`    | Frontend origin, used for CORS                        |
| `NODE_ENV`      | `development` \| `production` \| `test`               |

Never commit your real `server/.env` file — it's already git-ignored.

## Project structure

```
application-tracker/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/     Reusable UI (forms, modals, badges, layout)
│       ├── pages/          One component per route (Dashboard, Applications, ...)
│       ├── services/       Fetch wrapper for the REST API
│       ├── hooks/          Shared hooks (useAuth, useTags)
│       └── context/        AuthContext (current user, login/register/logout)
│
├── server/                 Express + Prisma backend
│   ├── controllers/        Request handlers, one file per resource
│   ├── routes/             Express routers, mounted under /api
│   ├── middleware/         Auth guard, error handler, async wrapper
│   ├── services/           Shared Prisma client
│   ├── utils/              Validation helpers, AppError
│   ├── prisma/             schema.prisma and migrations
│   └── tests/              Jest + Supertest backend tests
│
├── .env.example             Template for server/.env
└── package.json              Root scripts (npm run dev, etc.)
```

## Future features

- **AI-powered job search**: let users describe the kind of role they want
  (title, location, placement/internship/graduate, salary, remote/hybrid,
  technologies, industries) and have the system suggest matching jobs with
  a relevance score and reasoning, which can be saved directly as a saved
  job.
- **Cybersecurity learning**: once the core app is stable, it will be used
  as a personal, local-only target for practising concepts learned on
  platforms like TryHackMe/Hack The Box (authN/authZ, IDOR, SQLi, XSS,
  CSRF, API and session security). The deployed/production version will
  not intentionally contain vulnerabilities.
