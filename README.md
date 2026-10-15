# 💻 Workforce Hub - Enterprise Frontend Portal

The modern, responsive web application for the **WorkforceHub Enterprise Suite**, built with HTML5, Tailwind CSS, JavaScript (ES6+), and Chart.js.

Designed for seamless deployment with zero build steps on **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 🌟 Key Features

- **Executive KPI Dashboard**: Live metrics tracking workforce size, active percentage, average compensation, and team performance index.
- **Visual Analytics with Chart.js**:
  - Interactive Doughnut chart for department headcount distribution.
  - Bar chart tracking operational status breakdown (Active, Remote, On Leave).
- **Comprehensive Employee Directory**:
  - Toggle between **Data Table** and **Responsive Grid Cards**.
  - Real-time search across names, positions, emails, and departments.
  - Multi-attribute filtering by Department and Employment Status.
- **Complete CRUD Operations**: Create new employee profiles, edit existing records, and delete records via REST API with toast notifications.
- **Data Export**: 1-click export of staff records to CSV format.
- **Fail-Safe Resilient Architecture**: Includes an API connection modal with live connection test and a graceful fallback cache to ensure the deployed UI never crashes or shows an empty screen even during cloud backend cold starts.

---

## 🚀 Live Deployment Guide

### Deploying to GitHub Pages (Fastest - Free & Instant)

1. Create a repository on GitHub (e.g. `workforce-hub-frontend`).
2. Push the files in this directory to your repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of WorkforceHub frontend"
   git branch -M main
   git remote add origin https://github.com/<your-username>/workforce-hub-frontend.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Navigate to **Settings** &rarr; **Pages**.
   - Under **Build and deployment**, set Source to **Deploy from a branch**.
   - Select Branch: `main` and folder `/ (root)`.
   - Click **Save**.
4. Your live site will be ready at:
   `https://<your-username>.github.io/workforce-hub-frontend/`

---

## ⚙️ Running Locally

Simply open `index.html` in any web browser, or serve it using Python's built-in HTTP server:
```bash
python -m http.server 3000
```
Then visit: `http://localhost:3000`
