<div align="center">

  <h1>⚡ HireWire</h1>
  <p><strong>AI-Powered Job Application Tracker & Career Management Platform</strong></p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Google_Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"></a>
  </p>

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## 📌 Overview

**HireWire** is a modern full-stack web application designed for ambitious professionals and software engineers to organize, automate, and accelerate their job search. It provides an intuitive Kanban pipeline, AI-assisted job description parsing via Google Gemini, recruiter contact tracking, and rich visual analytics.

---

## ✨ Key Features

- 📊 **Kanban & List Pipeline**: Drag-and-drop or status-card tracking for every stage (*Wishlist, Applied, Interviewing, Offer, Rejected*).
- 🤖 **AI Job Description Parser**: Integrated with **Google Gemini AI** to automatically extract required skills, salary ranges, and key qualifications from any pasted job description.
- 📈 **Analytics & Insights**: Interactive dashboard powered by Recharts showing application velocity, response rates, and interview conversion metrics.
- 👥 **Recruiter & Contact Management**: Save hiring managers, recruiters, and interviewers with direct links to job applications.
- ⏰ **Activities & Reminders**: Set follow-up tasks, technical interview dates, and offer deadlines.
- 🔐 **Secure Authentication**: Full JWT-based auth with password encryption, token persistence, and route protection.
- 🎨 **Modern Aesthetics**: Sleek dark/light theme options, dynamic animations via Framer Motion, and responsive UI components.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/) + Radix UI Primitives + Lucide Icons
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State & Data**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query) + Axios
- **Charts**: [Recharts](https://recharts.org/)

### **Backend**
- **Framework**: [NestJS 11](https://nestjs.com/) (Node.js)
- **Database ORM**: [TypeORM](https://typeorm.io/) with [PostgreSQL](https://www.postgresql.org/)
- **Auth**: Passport JWT + bcrypt password hashing
- **Validation**: `class-validator` + `class-transformer`

### **AI & Third-Party APIs**
- **Google Generative AI**: `@google/generative-ai` (Gemini model integration)

---

## 📁 Repository Structure

```text
hirewire/
├── frontend/                  # React + Vite Client
│   ├── src/
│   │   ├── api/               # Axios services & API clients
│   │   ├── components/        # UI components, modals, skeletons
│   │   ├── pages/             # Route pages (Dashboard, Login, Register, Landing)
│   │   ├── store/             # Zustand global state
│   │   └── utils/             # Validation helpers & constants
│   ├── vercel.json            # Vercel SPA routing rewrite config
│   └── package.json
│
└── backend/                   # NestJS Server
    ├── src/
    │   ├── activities/        # Reminders & activity tracking module
    │   ├── ai/                # Gemini AI parser & insights module
    │   ├── analytics/         # Metrics & stats module
    │   ├── applications/      # Job application CRUD module
    │   ├── auth/              # JWT Auth, guard, & strategies
    │   ├── contacts/          # Recruiter contacts module
    │   ├── entities/          # TypeORM PostgreSQL entities
    │   ├── tags/              # Skill tags module
    │   └── main.ts            # Application bootstrap & CORS
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **PostgreSQL**: Local database or cloud instance (e.g. Neon, Render, Supabase)
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/AlaaAsaad03/HireWire.git
cd HireWire
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hirewire
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend development server:
```bash
npm run start:dev
```
*The NestJS API will run at `http://localhost:3000`.*

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3000
```

Run the frontend development server:
```bash
npm run dev
```
*The React app will run at `http://localhost:5173`.*

---

## 🌐 Deployment

| Service | Hosting Provider | Config File |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | `frontend/vercel.json` |
| **Backend** | [Render](https://render.com/) | `backend/package.json` |
| **Database** | Render PostgreSQL | `backend/src/app.module.ts` |

### Deployment Environment Variables
- **Frontend (Vercel)**:
  - `VITE_API_URL`: URL of your backend (e.g., `https://hirewire-api.onrender.com`)
- **Backend (Render)**:
  - `DATABASE_URL`: Connection string for PostgreSQL
  - `JWT_SECRET`: Random secret key for signing tokens
  - `GEMINI_API_KEY`: Google AI API Key

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an Issue for bug reports or feature suggestions.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the **UNLICENSED** / **MIT** license.

Developed with ❤️ by **[Alaa As'ad](https://github.com/AlaaAsaad03)**.
