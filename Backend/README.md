# CiviLanka Backend

Express.js API for the CiviLanka mobile application. This stage provides server startup, the MongoDB connection, the User model, and the health-check route.

Login uses JWT. Certificate CRUD is not implemented yet.

## Requirements

- Node.js and npm
- A MongoDB connection string

## Install and run

```powershell
cd C:\Desktop\CiviLanka_Final\Backend
npm install
npm run dev
```

From the repository root, `cd Backend` is enough.

The server listens on `0.0.0.0` and prints:

```text
CiviLanka API running on port 5000
```

## Environment variables

Create `Backend/.env` from the example if it does not exist:

```powershell
Copy-Item .env.example .env
```

`Backend/.env`

```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
```

Replace `your_mongodb_connection_string` with a real MongoDB URI, for example:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/civilanka
```

A successful connection prints:

```text
MongoDB connected successfully
```

A missing or rejected URI prints `MongoDB connection failed` and the reason. The health route still works without MongoDB.

Never commit `.env`. It is ignored by Git. Commit `.env.example` only.

## Health check

`GET /api/health`

```json
{
  "success": true,
  "message": "CiviLanka API is running"
}
```

Browser or PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Any other method or subpath under `/api/health` returns:

```json
{
  "success": false,
  "message": "Invalid health route request"
}
```

Unknown routes return `Route not found`.

## User model

`src/models/User.js` stores accounts. Passwords are saved as bcrypt hashes.

Fields: `name`, `email`, `username`, `serviceNumber`, `password`, `role`, `createdAt`.

Roles: `user`, `village_officer`, `district_registrar`, `marriage_registrar`, `bank_manager`, `admin`.

`POST /api/auth/login` checks the username, service number, and password, then returns a JWT.

`GET /api/auth/me` requires `Authorization: Bearer <token>`.

Set `JWT_SECRET` and `JWT_EXPIRE=7d` in `Backend/.env`. Do not commit the secret. Only an admin can add staff accounts, from `POST /api/users`.

## Layout for later CRUD

```text
src/routes        HTTP paths
src/controllers   request handling
src/models        Mongoose schemas
src/config        database connection
src/middleware    JWT checks
```

A later certificate module should add its route, controller, and model in those folders.

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| Development | `npm run dev` | Starts nodemon |
| Production-style | `npm start` | Starts Node once |
