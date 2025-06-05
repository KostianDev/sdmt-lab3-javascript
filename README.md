# 📝 Full-Stack JavaScript “Todo List” App  
*(Node.js + Express • MySQL • Docker & Docker Compose)*

> A minimal demo that shows how to build, containerise, and run a complete CRUD web application with persistent storage—all in a few commands.

---

## Table of Contents
1. [Features](#features)
2. [Quick Start (Docker Compose)](#quick-start-docker-compose)
3. [Local Run (No Docker)](#local-run-no-docker)
4. [Configuration](#configuration)
5. [Data Persistence](#data-persistence)
6. [Troubleshooting](#troubleshooting)
7. [Licence](#licence)

---

## Features
- **CRUD API**: Create, list, update, delete tasks (`/api/tasks`).
- **Simple Front-End**: Vanilla HTML + JS with AJAX (fetch).
- **MySQL Storage**: Tasks persist in a relational DB.
- **Dockerised**: Multi-stage build → small, production-ready image.
- **One-Command Boot-Up**: `docker-compose up --build`.
- **Data Volume**: Named Docker volume keeps data between restarts.

---

| Layer | Tech |
|-------|------|
| **Client** | Static HTML + vanilla JS (DOM & fetch) |
| **API**    | Node.js 20, Express, `mysql2` client |
| **DB**     | MySQL 8 (official image) |
| **Infra**  | Docker (multi-stage `node:20-slim`), Docker Compose |

---

## Quick Start (Docker Compose)

> **Prerequisites**: Docker ≥ 24 & Docker Compose plugin (`docker compose`), open ports **3000** (app) & **3306** (optional DB).

```bash
# 1. Grab the code
git clone https://github.com/KostianDev/sdmt-lab3-javascript
cd sdmt-lab3-javascript

# 2. Build & run everything (app + MySQL + volume)
docker compose up --build
````

* Visit **[http://localhost:3000](http://localhost:3000)** ➜ add / tick / delete tasks.
* **Stop** with `Ctrl+C` or `docker compose down`.
* Start again with `docker compose up`—your tasks are still there (persisted in `db_data` volume).

---

## Local Run (No Docker)

1. Install **Node 20+** and **MySQL 8+** locally.

2. Create a database/user:

   ```sql
   CREATE DATABASE tasksdb;
   CREATE USER 'tasksuser'@'localhost' IDENTIFIED BY 'taskspassword';
   GRANT ALL ON tasksdb.* TO 'tasksuser'@'localhost';
   ```

3. Copy & edit `.env.example` → `.env` **or** export variables:

   ```bash
   export DB_HOST=localhost
   export DB_USER=tasksuser
   export DB_PASSWORD=taskspassword
   export DB_NAME=tasksdb
   export PORT=3000
   ```

4. Install deps & run:

   ```bash
   npm install
   node server.js
   ```

5. Open **[http://localhost:3000](http://localhost:3000)**.

---

## Configuration

| Variable      | Default (docker-compose) | Description              |
| ------------- | ------------------------ | ------------------------ |
| `PORT`        | `3000`                   | Port Express listens on  |
| `DB_HOST`     | `mysql`                  | Hostname of MySQL server |
| `DB_USER`     | `tasksuser`              |                          |
| `DB_PASSWORD` | `taskspassword`          |                          |
| `DB_NAME`     | `tasksdb`                |                          |

In Docker, these come from **`docker-compose.yml`**.
For local runs, use a `.env` file or shell exports.

---

## Data Persistence

The MySQL container mounts the named volume **`db_data`** at `/var/lib/mysql`.
As long as you **do not** run `docker volume rm db_data` (or `docker compose down -v`), your task list survives container rebuilds, reboots, and updates.

---

## Troubleshooting

| Symptom                   | Fix                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `ECONNREFUSED` on startup | MySQL may still be initialising. Wait a few seconds—Express retries on each request. |
| Port 3000 already in use  | Change `ports` mapping in `docker-compose.yml` or free the port.                     |
| Need a clean DB           | `docker compose down -v` then `docker compose up --build`.                           |
| “Access denied for user”  | Check `DB_USER`/`DB_PASSWORD` values match both services.                            |

---

## Licence

MIT © *Your Name* – use freely, contributions welcome!
