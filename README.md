# PayPool - Bill Splitting Application

A modern Angular-based bill-splitting application designed to manage group expenses with ease. Built with authentication, authorization, group and expense tracking, and clean UI – all using Angular (latest) and JSON Server for API simulation.
---
## Live Demo
https://pay-pool.vercel.app
---

## 📌 Features

- 🔐 **User Authentication & Registration**
  - Register with name, email, password (min 8 characters)
  - Login with email/password
  - Token-based authentication using interceptors
  - Session state management (LocalStorage)
  - Route guards for protected pages

- 🧾 **Dashboard**
  - View your created groups
  - Create new groups with participants
  - Quick access to group expense summaries

- 👥 **Groups & Expenses**
  - Add participants (name, email)
  - Add expenses (description, amount, date, assigned participants)
  - View detailed expense breakdown and dues

- 🚪 **Logout**
  - One-click logout that clears session data

---

## 🛠️ Tech Stack

| Tech             | Purpose                              |
|------------------|---------------------------------------|
| Angular (v17+)   | Frontend framework                    |
| Angular Signals  | Reactive state management             |
| Reactive Forms   | Form handling and validation          |
| JSON Server      | Mock backend for CRUD operations      |
| Angular Router   | SPA navigation                        |
| Interceptors     | Token injection into HTTP requests    |
| Route Guards     | Authentication protection             |

---
