# Omega Admin Backend — README

## Overview

Omega Admin Backend is a Node.js + Express API that provides user and business management features for an administrative system. It uses PostgreSQL as its database and supports JWT-based authentication.

---

## Features

* User authentication and profile management (JWT protected)
* CRUD operations for business entities
* PostgreSQL database integration
* Modular MVC structure (Controllers, Models, Routes)
* Configurable via environment variables

---

## Project Structure

```
Omega-admin-backend-main/
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── businessController.js
│   └── userController.js
├── database/
│   └── db.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── businessModel.js
│   └── userModel.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── businessRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── logger.js
│   └── responseHelper.js
├── server.js
├── package.json
└── README.md
```

---

## Installation

### Prerequisites

* Node.js v18 or later
* npm or yarn
* PostgreSQL database instance

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Nelly6002/Omega-admin-backend
   cd Omega-admin-backend-main/Omega-admin-backend-main
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/omega_db
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Run in development mode:

   ```bash
   npm run dev
   ```

5. Start production server:

   ```bash
   npm start
   ```

---

## API Endpoints

### User Routes (`/user`)

| Method | Endpoint | Description                         |
| ------ | -------- | ----------------------------------- |
| GET    | /user    | Get authenticated user's profile    |
| PUT    | /user    | Update authenticated user's profile |
| DELETE | /user    | Delete authenticated user account   |

### Business Routes (`/business`)

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| GET    | /business     | Fetch all businesses    |
| POST   | /business     | Create a new business   |
| GET    | /business/:id | Get a business by ID    |
| PUT    | /business/:id | Update business details |
| DELETE | /business/:id | Delete business by ID   |

> All `/user` routes are protected by JWT authentication middleware.

---

## Database Configuration

* The database connection is managed via `database/db.js` using the `pg` package.
* Ensure your PostgreSQL instance is running and credentials in `.env` are correct.

### Recommended Tables

**Users Table:**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Businesses Table:**

```sql
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| PORT         | Server port                          |
| DATABASE_URL | PostgreSQL connection string         |
| JWT_SECRET   | Secret key for JWT authentication    |
| NODE_ENV     | Environment (development/production) |

---

## Development Scripts

| Command       | Description                       |
| ------------- | --------------------------------- |
| `npm install` | Install dependencies              |
| `npm run dev` | Run in development (with nodemon) |
| `npm start`   | Start in production mode          |

---

## Deployment

1. Set `NODE_ENV=production` and `PORT` in your environment.
2. Ensure `DATABASE_URL` points to a live PostgreSQL instance.
3. Run `node server.js` or use a process manager like PM2.

---

## Known Issues / TODOs

* Inconsistent import paths between `models` and `database` folders.
* Empty `authController.js`, `adminController.js`, and related routes.
* Missing `server.js` route registration (to be implemented).
* Add migration and seed scripts.

---

## Contributing

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes and push.
4. Open a pull request.

---

## License

This project is Not open source and available under the MIT License.
