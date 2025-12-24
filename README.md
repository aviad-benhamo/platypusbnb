# MisterToy - Backend

> Backend for the MisterToy toy-store project (Express + Node).

## Table of Contents
- [Project](#project)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Run](#run)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Data](#data)
- [Contributing](#contributing)

## Project

This repository contains the backend API for MisterToy. It provides toy management, user management, and authentication endpoints used by the frontend.

## Tech Stack

- Node.js (ES modules)
- Express
- MongoDB (driver)
- Other libs: `bcrypt`, `cookie-parser`, `cors`, `cryptr`, `dotenv`

## Prerequisites

- Node.js 16+ / npm
- (Optional) MongoDB if using a real DB; this project includes a `data/` JSON store for local development.

## Install

1. Clone the repo
2. Install dependencies:

```bash
npm install
```

## Run

- Start in development (with `nodemon`):

```bash
npm run start
```

- Other available scripts (from `package.json`):

```bash
npm run server:dev
npm run server:prod
```

The app entry is [server.js](server.js).

## Configuration

Configuration files are in the `config/` folder (`config/dev.js`, `config/prod.js`, `config/index.js`). Environment variables (if used) should be configured before running production.

## API Endpoints

Base URL: `/api`

Auth

- POST `/api/auth/login` — login a user
- POST `/api/auth/signup` — create a new user
- POST `/api/auth/logout` — logout

Toys

- GET `/api/toy/` — get list of toys
- GET `/api/toy/:id` — get toy by id
- POST `/api/toy/` — add a toy (admin only)
- PUT `/api/toy/` — update a toy (admin only)
- DELETE `/api/toy/:id` — delete a toy (admin only)
- POST `/api/toy/:id/msg` — add a message to a toy (authenticated users)
- DELETE `/api/toy/:id/msg/:msgId` — remove a message (authenticated users)

Users

- GET `/api/user/` — get list of users
- GET `/api/user/:id` — get user by id
- PUT `/api/user/:id` — update user
- DELETE `/api/user/:id` — delete user

Notes

- Protected routes use middlewares in `middlewares/` (`requireAuth.middleware.js`, `logger.middleware.js`).
- See route files in `api/*/` for exact handlers.

## Example Requests

- Login (curl):

```bash
curl -X POST http://localhost:3030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"1234"}'
```

- Get toys:

```bash
curl http://localhost:3030/api/toy
```

## Project Structure

- [server.js](server.js) — app entry
- [api/](api/) — route folders for `auth`, `toy`, `user`
- [config/](config/) — environment configs
- [data/toys.json](data/toys.json) — sample data store
- [services/](services/) — helper services (db, util, logger)
- [middlewares/](middlewares/) — auth/logger middlewares

## Data

The repo includes a simple JSON data file for quick local development: `data/toys.json`.

## Contributing

Feel free to open issues and PRs. For local development, use the `start` script.

---
Created for the MisterToy course project.
