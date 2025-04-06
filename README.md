# Fullstack App Setup Guide

This project is a fullstack application consisting of:

- 🔧 **Backend** (`./backend`) — built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/)
- 🌐 **Frontend** (`./frontend`) — built with [Next.js](https://nextjs.org/)
- ⚡ Uses [Bun](https://bun.sh/) as the JavaScript runtime and package manager for both frontend and backend

---

## ⚒️ Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/docs/installation)
- [PostgreSQL](https://www.postgresql.org/download/) or your preferred database (configured in `.env`)
- Node.js (optional, but may help with Prisma binaries)

---

## 📂 Backend Setup (`./backend`)

1. Navigate to the backend directory:

   ```bash
   cd ./backend
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

3. Copy the environment configuration:

   ```bash
   cp .env.example .env
   ```

4. Update your `.env` file:

   Set your database connection string:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/your_db_name"
   ```

5. Generate Prisma client:

   ```bash
   bunx prisma generate
   ```

6. Run database migrations:

   ```bash
   bunx prisma migrate dev
   ```

7. Start the NestJS server:

   ```bash
   bun run start:dev
   ```

   The server should run on `http://localhost:3001` (or whatever port is set in `.env`).

---

## 💻 Frontend Setup (`./frontend`)

1. Navigate to the frontend directory:

   ```bash
   cd ./frontend
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

3. Copy the environment configuration:

   ```bash
   cp .env.example .env
   ```

4. Update your `.env` file:

   Make sure the frontend can communicate with the backend:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

5. Run the development server:

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:3000`.

---

## ✅ Done!

You now have both backend and frontend servers running using Bun. You can start developing and testing the application.

---

## 📝 Notes

- For additional Prisma commands, refer to [Prisma CLI Docs](https://www.prisma.io/docs/reference/api-reference/command-reference).
- If you're running into issues with Bun and Prisma on certain platforms, try installing the Prisma CLI globally with npm or pnpm and fallback to `npx prisma`.

---

Happy hacking ���
