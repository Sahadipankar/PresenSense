
# PresenSense - Emotion-Aware Attendance Tracking System

PresenSense is an AI-powered system that ensures secure attendance through facial recognition while also tracking emotions, mood, and engagement in real time. It works seamlessly across classes, offices, webinars, and online meetings, providing a smart analytics dashboard for teachers, managers, and HR to monitor presence, attention, and overall participation.

This monorepo contains three main folders: `admin`, `client`, and `server`. Each folder serves a distinct purpose in the overall application, which is designed for facial recognition-based attendance, emotion analysis, and user management.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Admin Frontend](#admin-frontend)
  - [Folder Structure](#admin-folder-structure)
  - [Pages & Components](#admin-pages--components)
  - [Libraries & Packages](#admin-libraries--packages)
  - [Workflow & Functionality](#admin-workflow--functionality)
- [Client Frontend](#client-frontend)
  - [Folder Structure](#client-folder-structure)
  - [Pages & Files](#client-pages--files)
  - [Libraries & Packages](#client-libraries--packages)
  - [Workflow & Functionality](#client-workflow--functionality)
- [Server Backend](#server-backend)
  - [Folder Structure](#server-folder-structure)
  - [Key Files & Modules](#server-key-files--modules)
  - [Libraries & Packages](#server-libraries--packages)
  - [Workflow & Functionality](#server-workflow--functionality)
- [End-to-End Workflow](#end-to-end-workflow)
- [Output & Results](#output--results)

---


# Project Overview

PresenSense is a full-stack, AI-powered attendance and engagement tracking system. It provides:
- **Admin Frontend**: For administrators to manage attendance, capture faces, upload images, and view analytics on emotions and engagement.
- **Client Frontend**: For end-users to mark attendance and participate in emotion/engagement tracking.
- **Server Backend**: Handles API requests, facial recognition, emotion analysis, database operations, and business logic.
# Notes
# Installation & Running the Project

Follow these steps to install and run PresenSense on your local machine:

## Prerequisites
- **Node.js** (v16 or above) and **npm** for frontend apps
- **Python** (3.8 or above) for backend
- **pip** for Python package management
- (Optional) **Docker** for containerized deployment

## 1. Clone the Repository

```
git clone <your-repo-url>
cd face-reco
```


## 2. Install and Run the Backend (Server)

```
cd server
pip install -r requirements.txt
```

### Run with Python (default)
```
python main.py
```
The backend will start (by default) on `http://localhost:8000` or as configured in `config.py`.

### Run with Uvicorn (recommended for FastAPI)
If your backend uses FastAPI, you can run it with Uvicorn for better performance and auto-reload:
```
.venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- `main:app` refers to the `app` object in `main.py`.
- `--reload` enables auto-reload for development.

The backend will now be running at http://localhost:8000.

## 3. Install and Run the Admin Frontend

```
cd ../admin
npm install
npm run dev
```
The admin dashboard will be available at the URL shown in the terminal (usually `http://localhost:5173`).

## 4. Install and Run the Client Frontend

```
cd ../client
npm install
npm run dev
```
The client app will be available at the URL shown in the terminal (usually `http://localhost:5173`).

## 5. (Optional) Run with Docker

You can use the provided `Dockerfile` in the `server` folder to build and run the backend in a container:

```
cd server
docker build -t presensense-backend .
docker run -p 8000:8000 presensense-backend
```

---

**This README provides a comprehensive overview for developers and users to understand, run, and extend PresenSense.**

[Back to Top](#table-of-contents)

---

# Folder Structure

```
face-reco/
│
├── admin/      # Admin dashboard frontend (React + Vite)
├── client/     # Client/user-facing frontend (React + Vite)
└── server/     # Python backend (FastAPI/Flask, face recognition)
```

[Back to Top](#table-of-contents)

---

# Admin Frontend

The `admin` folder contains the admin dashboard built with React and Vite. It allows administrators to manage attendance, capture new faces, and upload images for recognition.

## Admin Folder Structure

```
admin/
│
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── src/
    ├── App.jsx
    ├── config.js
    ├── main.jsx
    ├── styles.css
    └── components/
        ├── Attendance.jsx
        ├── CaptureForm.jsx
        └── UploadForm.jsx
```

[Back to Top](#table-of-contents)

## Admin Pages & Components

- **index.html**: The HTML entry point for the Vite-powered React app.
- **package.json**: Lists dependencies (React, Vite, etc.) and scripts for development/build.
- **vite.config.js**: Vite configuration for fast development and optimized builds.
- **src/App.jsx**: Main React component; sets up routing and layout for the admin dashboard.
- **src/config.js**: Stores configuration variables (e.g., API endpoints).
- **src/main.jsx**: Entry point for React; renders the `App` component.
- **src/styles.css**: Global styles for the admin dashboard.
- **src/components/Attendance.jsx**: Component to view and manage attendance records.
- **src/components/CaptureForm.jsx**: Form to capture new face data (e.g., via webcam or file upload).
- **src/components/UploadForm.jsx**: Form to upload images for recognition or registration.

[Back to Top](#table-of-contents)

## Admin Libraries & Packages

- **React**: UI library for building interactive user interfaces.
- **Vite**: Fast build tool and development server for React apps.
- **Other dependencies** (as per `package.json`):
  - UI libraries (e.g., Material-UI, if present)
  - HTTP clients (e.g., axios or fetch)
  - State management (if used)

**Purpose:**
- React enables modular, reusable components.
- Vite provides fast hot-reloading and optimized builds.
- UI libraries help create professional, accessible interfaces.
- HTTP clients are used for API communication with the backend.

[Back to Top](#table-of-contents)

## Admin Workflow & Functionality

1. **Login/Access**: Admin accesses the dashboard via the browser.
2. **Attendance Management**: View, filter, and manage attendance records using `Attendance.jsx`.
3. **Capture New Faces**: Use `CaptureForm.jsx` to capture new face data (webcam or upload).
4. **Upload Images**: Use `UploadForm.jsx` to upload images for recognition or registration.
5. **API Communication**: All actions interact with the backend server via REST APIs defined in `config.js`.

[Back to Top](#table-of-contents)

---

# Client Frontend

The `client` folder contains the user-facing frontend, also built with React and Vite. It allows users to interact with the facial recognition system (e.g., mark attendance).

## Client Folder Structure

```
client/
│
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── config.js
    ├── main.jsx
    └── styles.css
```

[Back to Top](#table-of-contents)

## Client Pages & Files

- **index.html**: HTML entry point for the client app.
- **package.json**: Lists dependencies and scripts for the client app.
- **vite.config.js**: Vite configuration for the client app.
- **src/App.jsx**: Main React component for the client interface.
- **src/config.js**: Stores configuration variables (e.g., API endpoints).
- **src/main.jsx**: Entry point for React; renders the `App` component.
- **src/styles.css**: Global styles for the client interface.

[Back to Top](#table-of-contents)

## Client Libraries & Packages

- **React**: For building the user interface.
- **Vite**: For fast development and builds.
- **Other dependencies** (as per `package.json`):
  - HTTP clients (e.g., axios or fetch)
  - UI libraries (if present)

**Purpose:**
- React enables a responsive, interactive user experience.
- Vite ensures fast development cycles.
- HTTP clients are used for communication with the backend.

[Back to Top](#table-of-contents)

## Client Workflow & Functionality

1. **User Access**: Users access the client app via the browser.
2. **Mark Attendance**: Users interact with the app to mark attendance (e.g., via webcam or upload).
3. **API Communication**: The app communicates with the backend server for recognition and attendance marking.

[Back to Top](#table-of-contents)

---

# Server Backend

The `server` folder contains the backend, written in Python. It handles API requests, facial recognition, and database operations.

## Server Folder Structure

```
server/
│
├── __init__.py
├── backend.db
├── config.py
├── db.py
├── deploy.md
├── Dockerfile
├── main.py
├── requirements.txt
├── requirements-alternative.txt
├── startup.py
├── test_local.py
├── logs/
├── models/
│   ├── __init__.py
│   └── face_recognition.py
├── routes/
│   ├── __init__.py
│   ├── admin.py
│   └── match.py
├── uploads/
└── utils/
    ├── __init__.py
    └── storage.py
```

[Back to Top](#table-of-contents)

## Server Key Files & Modules

- **main.py**: Entry point for the backend server (likely FastAPI or Flask). Defines API endpoints.
- **config.py**: Configuration settings (e.g., database URI, secret keys).
- **db.py**: Database connection and ORM logic.
- **models/face_recognition.py**: Core facial recognition logic (using libraries like `face_recognition`, OpenCV, etc.).
- **routes/admin.py**: API routes for admin operations (attendance, user management).
- **routes/match.py**: API routes for face matching/recognition.
- **utils/storage.py**: Utility functions for file storage (e.g., saving uploads).
- **uploads/**: Directory for storing uploaded images.
- **logs/**: Directory for server logs.
- **Dockerfile**: Containerization for deployment.
- **requirements.txt**: Python dependencies (Flask/FastAPI, face_recognition, etc.).

[Back to Top](#table-of-contents)

## Server Libraries & Packages

- **Flask/FastAPI**: For building RESTful APIs.
- **face_recognition**: For facial recognition tasks.
- **OpenCV**: For image processing.
- **SQLite**: For lightweight database storage (`backend.db`).
- **Other dependencies**: As listed in `requirements.txt` (e.g., numpy, uvicorn, etc.).

**Purpose:**
- Web frameworks handle API requests and routing.
- `face_recognition` and OpenCV perform face detection and matching.
- SQLite stores user and attendance data.

[Back to Top](#table-of-contents)

## Server Workflow & Functionality

1. **API Endpoints**: Exposes endpoints for face registration, recognition, and attendance management.
2. **Face Processing**: Receives images, processes them, and matches faces using `face_recognition`.
3. **Database Operations**: Stores and retrieves user and attendance data.
4. **File Storage**: Handles image uploads and storage.
5. **Logging**: Maintains logs for debugging and monitoring.

[Back to Top](#table-of-contents)

---

# End-to-End Workflow

1. **Admin registers users and manages attendance via the admin dashboard.**
2. **Users mark attendance via the client app (face capture/upload).**
3. **Both frontends communicate with the backend via REST APIs.**
4. **Backend processes images, performs recognition, and updates the database.**
5. **Results (attendance, recognition status) are displayed in the respective frontends.**

[Back to Top](#table-of-contents)

---

# Output & Results

- **Admin Dashboard**: View and manage attendance, register new users, upload images.
- **Client App**: Mark attendance, receive feedback on recognition status.
- **Backend**: Processes images, matches faces, updates attendance records, and stores data securely.

**End Result:**
- A complete facial recognition-based attendance system with separate interfaces for admins and users, powered by a robust Python backend.

[Back to Top](#table-of-contents)

---

# Notes
- For detailed API documentation, refer to the backend code and comments.
- For UI/UX customization, modify the React components and styles in the respective `src/` folders.
- For deployment, use the provided Dockerfile and requirements files.

---

**This README provides a comprehensive overview for developers and users to understand, run, and extend the Face Recognition System.**
