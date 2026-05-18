# The Global Kitchen API

A professional backend RESTful API for managing a digital cookbook, built by **TATA MOdepet**. This project follows a 3-tier architecture (Routes, Controllers, Services) and uses MongoDB for robust data management.

## 🚀 Features
- **Full CRUD operations** for recipes.
- **Categorized Search**: Filter recipes by category.
- **Automatic Seeding**: Includes a local Cameroonian **Ndole** recipe on first run.
- **Data Validation**: Enforced at both the service and schema levels.
- **Polished UI**: Built with React, Tailwind CSS, and Framer Motion.

## 🛠 Tech Stack
- **Runtime**: Node.js (v20+)
- **Framework**: Express + React (Vite)
- **Database**: MongoDB (Atlas recommended)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (fka Framer Motion)

## 📦 Installation & Setup

1. **Clone the repository** (if applicable) or copy the files.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
5. **Open in Browser**:
   Navigate to `http://localhost:3000`

## 🏗 Project Structure
- `server.ts`: Entry point for backend and Vite middleware.
- `src/server/`: Backend logic (Routes, Controllers, Services, Models).
- `src/App.tsx`: Main React frontend.
- `src/server/db.ts`: Database connection and seeding logic.

## 📋 API Endpoints
- `GET /api/recipes`: List all recipes (optional `?category=...`).
- `POST /api/recipes`: Create a new recipe.
- `PATCH /api/recipes/:id`: Update a recipe.
- `DELETE /api/recipes/:id`: Delete a recipe.

---
Developed with ❤️ by **TATA MOdepet**
