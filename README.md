# CiviLanka

CiviLanka is a Sri Lankan government-service mobile application for managing and tracking birth certificates, death certificates, and marriage certificates.

This repository is the initial working foundation for a university group assignment. It is a real Expo mobile application and an Express API. It is not a clickable prototype, and it is not the finished certificate system.

Certificate CRUD, authentication, payments, notifications, and role-specific dashboards are intentionally not implemented in this stage.

## Assignment purpose

The group will build CiviLanka in stages. Later stages must satisfy the assignment requirements:

- A real, installable, and runnable mobile application
- Interfaces assigned to each group member
- At least 2 working CRUD operations on each assigned interface
- Functional test cases for the core features
- A traceability matrix from user requirements to features and test cases
- Usability testing with at least 5 real or proxy participants
- A version-controlled GitHub repository with setup instructions
- A written justification for any difference between the high-fidelity prototype and the built application
- Original group work

The project is organized so those later items can be traced:

User requirement → Mobile interface → Backend API → Database model → Functional test case

Future modules should follow this backend path:

Route → Controller → Model → MongoDB

## Technology stack

| Part | Technology |
| --- | --- |
| Mobile | React Native, Expo, JavaScript, React Navigation |
| Backend | Node.js, Express.js, JavaScript |
| Database | MongoDB, Mongoose |

## User roles planned for later stages

The User model already allows these roles. This stage does not build role dashboards, role navigation, or role-based access control.

| Role | Stored value |
| --- | --- |
| User | `user` |
| Village Officer | `village_officer` |
| District Registrar | `district_registrar` |
| Marriage Registrar | `marriage_registrar` |
| Bank Manager | `bank_manager` |
| Admin | `admin` |

## Current development scope

This stage includes:

1. Project setup
2. React Native Expo mobile application
3. Express.js backend
4. MongoDB connection
5. Environment variables
6. `GET /api/health`
7. Splash screen
8. Login screen with empty-field validation
9. Basic navigation
10. User model structure
11. Mobile API service
12. A mobile health-check test on the Home screen

Login does not call the API. Any non-empty username, service number, and password opens the Home screen. There is no JWT, OTP, registration, password hashing, or authorization.

## Project structure

```text
CiviLanka_Final/
├── Mobile/                 React Native Expo application
│   ├── assets/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   └── utils/
│   ├── App.js
│   └── package.json
├── Backend/                Express REST API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
└── README.md
```

`controllers/` and `middleware/` are empty on purpose. Later CRUD modules should add a route, a controller, and a model without changing this layout.

## Mobile setup

From the repository root:

```powershell
cd Mobile
npm install
npx expo start
```

Full path on this machine:

```powershell
cd C:\Desktop\CiviLanka_Final\Mobile
npm install
npx expo start
```

More detail is in [Mobile/README.md](Mobile/README.md).

## Backend setup

From the repository root:

```powershell
cd Backend
npm install
npm run dev
```

Full path on this machine:

```powershell
cd C:\Desktop\CiviLanka_Final\Backend
npm install
npm run dev
```

More detail is in [Backend/README.md](Backend/README.md).

## MongoDB configuration

1. Create a MongoDB database. A local server or MongoDB Atlas both work.
2. Copy the connection string.
3. Open `Backend/.env`.
4. Replace `your_mongodb_connection_string` with that connection string.

Example for a local database:

```text
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/civilanka
```

Do not commit the real connection string. `Backend/.env` is listed in `.gitignore`. Share `Backend/.env.example` instead. That file has an empty `MONGODB_URI`.

When the URI is valid, the backend prints:

```text
MongoDB connected successfully
```

If the URI is missing or rejected, the API still starts and prints a MongoDB connection error. `GET /api/health` does not need the database.

## Environment variables

`Backend/.env`

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for the Express server. Default in this project: `5000`. |
| `MONGODB_URI` | MongoDB connection string. Keep the real value out of Git. |

The mobile app does not use a `.env` file in this stage. The API address lives in one place: `Mobile/src/services/api.js`.

## How to run the backend

Open a terminal:

```powershell
cd C:\Desktop\CiviLanka_Final\Backend
npm install
npm run dev
```

Expected startup text:

```text
CiviLanka API running on port 5000
```

`npm run dev` uses nodemon, so the server restarts when backend files change. `npm start` runs the server once without nodemon.

## How to run the mobile app

Open a second terminal and leave the backend running:

```powershell
cd C:\Desktop\CiviLanka_Final\Mobile
npm install
npx expo start
```

## How to use Expo Go

1. Install **Expo Go** from the Google Play Store on the Android phone.
2. Connect the phone and the computer to the same Wi-Fi network.
3. Start the backend with `npm run dev`.
4. In `Mobile/src/services/api.js`, set `API_BASE_URL` to the computer's IPv4 address. See the next section.
5. Start Expo with `npx expo start`.
6. Open Expo Go.
7. Scan the QR code shown in the terminal.
8. Wait for the splash screen, move through the three onboarding screens, then open Officer Login. Login has no bottom bar.
9. Enter any non-empty username, service number, and password, then press **Login**.
10. On Home, press **Check Backend Status**.

If the QR code does not scan, the Expo terminal also shows a connection URL. In Expo Go, choose the option to enter the URL manually.

## How to test `GET /api/health`

With the backend running, open this address in a browser on the same computer:

```text
http://localhost:5000/api/health
```

From another device on the same Wi-Fi, replace `localhost` with the computer's IPv4 address:

```text
http://192.168.1.20:5000/api/health
```

Expected JSON:

```json
{
  "success": true,
  "message": "CiviLanka API is running"
}
```

PowerShell check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

## How to connect a physical Android device

`localhost` on the phone points at the phone, not at the computer. The app must call the computer's LAN address.

1. Start the backend.
2. Run:

```powershell
ipconfig
```

3. Under the active adapter, usually **Wi-Fi**, copy the **IPv4 Address**. On the machine used for this setup it was `192.168.1.20`. Your address may be different.
4. Open `Mobile/src/services/api.js` and set the single base URL:

```javascript
const API_BASE_URL = "http://192.168.1.20:5000/api";
```

5. Save the file. Expo Go should reload.
6. Computer and phone must stay on the same Wi-Fi.
7. The backend listens on `0.0.0.0`, so it accepts connections from the LAN, not only from the computer.

### If the phone cannot reach the backend

- Windows Firewall may block port `5000`. Allow Node.js, or allow inbound TCP port `5000`, on private networks.
- Guest Wi-Fi and some mobile hotspots block device-to-device traffic. Use a normal private Wi-Fi network.
- Confirm `ipconfig` still shows the same IPv4 address. It can change after a reconnect.
- Test `http://YOUR_IP:5000/api/health` in the phone's browser before testing inside the app.
- Do not put `http://localhost:5000/api` or `http://127.0.0.1:5000/api` in `api.js` for a physical phone.

## What you can test in this stage

1. Backend startup
2. MongoDB connection after a real URI is added
3. `GET /api/health`
4. Expo startup
5. Splash screen, then three onboarding screens, then login
6. Login validation for empty fields
7. Login opening the Home screen when all fields have a value
8. Bottom tabs: Home, News, Notification, Profile
9. Home screen **Check Backend Status** calling the API

## Visual note for the final report

The Officer Login screen follows the supplied reference: navy header, logo, Civil Registration Tracker title, government username, service number, password, help line, sign-in button, and the official, registration, and legal warning cards. The reference image includes a bottom bar on login. That bar is omitted on the login page, as requested, and appears only after sign-in.

The in-app mark is an original placeholder drawn in the app. It is not a government emblem. The launcher images in `Mobile/assets` use the same navy, white, and yellow placeholder mark.

If the group's high-fidelity prototype differs in spacing, wording, or artwork, record that difference in the final report.

Colors used everywhere:

- Primary navy `#0A1F44`
- White `#FFFFFF`
- Background `#F5F7FA`
- Dark text `#1E1E1E`
- Light border `#DFE1E4`
- Accent yellow `#F4C430`
- Muted text `#6B7280`

## Future development stages

The next stage should add the interfaces assigned to each group member. Each assigned interface needs at least two working CRUD operations, with functional tests and an updated traceability matrix.

Likely later modules:

- Birth certificate
- Death certificate
- Marriage certificate
- Certificate tracking
- User management
- Payments
- Notifications
- Real authentication and role-based access

Do not treat this foundation as a secure production system. Passwords are not hashed, and login is only a navigation check.
