# Team Task Manager (Full-Stack)

A premium, full-stack web application built to manage projects, assign tasks, and track team progress. Features role-based access control (Admin/Member), a modern glassmorphism UI, and a Kanban-style task board.

## 🚀 Features

- **Authentication**: JWT-based Signup/Login with robust validation.
- **Role-Based Access (RBAC)**: 
  - `Admin`: Can create projects, add team members, and create/assign tasks.
  - `Member`: Can view assigned projects/tasks and update task status (To-Do -> Done).
- **Project Management**: Create projects, view team members, and track project status.
- **Task Kanban Board**: Visual To-Do, In-Progress, and Done columns.
- **Dynamic Dashboard**: Real-time statistics on total, completed, and overdue tasks.
- **Premium UI/UX**: Dark mode by default, glassmorphism components, and smooth micro-animations.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router v6, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT)
- **Database**: MongoDB (Mongoose)
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables)

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or local)

### 1. Setup Backend
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=any_random_secret_string
NODE_ENV=development
```
Start the backend development server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Setup Frontend
Open a NEW terminal window and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
# React app runs on http://localhost:5173
```

---

## 🚂 Deployment to Railway (Mandatory for Assignment)

This repository is structured as a **monorepo**, meaning both backend and frontend are in the same repository. Railway handles this easily using "Custom Start Commands" or by deploying them as two separate services from the same GitHub repo.

### Step-by-Step Deployment Guide

1. **Push to GitHub**
   Initialize a git repository in the root folder (where this README is), commit all files, and push to a new GitHub repository.

2. **Deploy Database**
   You can either continue using your existing MongoDB Atlas cluster, or create a new MongoDB database directly in Railway.

3. **Deploy Backend API**
   - In Railway, click **New Project** -> **Deploy from GitHub repo**.
   - Select your repository.
   - Click **Add Variables** and add:
     - `MONGODB_URI`: (Your connection string)
     - `JWT_SECRET`: (Your secret)
     - `PORT`: `5000`
   - Go to the service **Settings** -> **Build**:
     - Root Directory: `/backend`
   - Go to **Networking** and click **Generate Domain** (e.g., `taskflow-api.up.railway.app`).

4. **Deploy Frontend**
   - In the same Railway project, click **New Service** -> **GitHub Repo** -> (Select the same repo again).
   - Go to the new service **Settings** -> **Build**:
     - Root Directory: `/frontend`
   - Go to **Variables** and add:
     - `VITE_API_URL`: The domain you generated for the backend in Step 3 (e.g., `https://taskflow-api.up.railway.app/api`).
     - *Note: In this specific implementation, you'll need to update `frontend/src/services/api.js` to use `import.meta.env.VITE_API_URL` instead of the hardcoded `localhost:5000` before pushing.*
   - Go to **Networking** and click **Generate Domain**. This will be your Live URL!

## 📦 Submission

- **Live URL**: https://frontend-production-3be5.up.railway.app/
- **GitHub Repo**: https://github.com/tomarnidhi859/Task_manager01.git
