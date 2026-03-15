<div align="center">

# ✨ TodoApp: The Modern Task Manager ✨

**A beautifully designed, highly interactive, and fully responsive daily planner built with the MERN stack.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)

*Organize your life, plan your days, and never miss a deadline again.*

</div>

---

## 🎨 UI & Design Highlights
This isn isn\'t just another standard Todo app; it\'s designed with modern web aesthetics in mind:
- **🔮 Glassmorphism:** Semi-transparent frosted glass effects on sidebars and task cards.
- **🌌 Dynamic Backgrounds:** Animated, slowly pulsing gradient orbs that bring the app to life.
- **📱 Fully Responsive:** Carefully crafted layouts that look amazing on desktops, tablets, and phones.
- **✨ Micro-Interactions:** Smooth hover effects, scaling animations, and seamless transitions using Tailwind CSS.

---

## 🔥 Core Features

* 🎯 **Smart Task Routing:** Easily switch between `My Day`, `Planned` (7-day view), `Important`, and `All Tasks` views.
* ✅ **Real-Time CRUD:** Instantly Add, Read, Update (Complete/Important status), and Delete tasks.
* ⭐ **Priority Management:** Star important tasks to pin them to the top of your radar.
* 📅 **Time Awareness:** Tasks automatically align with their due dates so you can plan the week ahead.
* 💾 **Persistent Data:** Securely stores all your tasks in a MongoDB database via a robust REST API.

---

## 🛠️ The Tech Stack

### Frontend (Client)
* **Core:** React 18, Vite (for lightning-fast HMR)
* **Styling:** Tailwind CSS (Custom themes & animations)
* **HTTP Client:** Axios
* **Icons:** Lucide-React

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose (Schema validation)
* **Middleware:** CORS, dotenv

---

## 🔒 Security & Authentication
The app uses a robust **Token-based Authentication** system to ensure seamless cross-domain support (ideal for Vercel deployments):
- **JWT (JSON Web Tokens):** Securely signed tokens for user sessions.
- **Authorization Headers:** Tokens are manually sent via `Authorization: Bearer <token>` to bypass browser cookie restrictions on different subdomains.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Saurabhanand12/TodoApp.git
cd TodoApp
```
