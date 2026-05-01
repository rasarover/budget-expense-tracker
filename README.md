# BudgetPro — Personal Finance Tracker

A browser-based personal finance tracker with budget planning, expense tracking, income management, and country-specific investment monitoring. All data stays on your device — no backend, no server, no data sharing.

---

## Features

### Budget Planner
- Set monthly budgets across categories (Food, Transport, Housing, etc.)
- Track spending vs. budget with visual progress bars
- Add custom categories and subcategories

### Expense Tracker
- Log expenses with category, subcategory, date, and payment method
- Filter and search by month, category, or keyword
- Visual breakdown with donut chart

### Income Tracker
- Record income from multiple sources (Salary, Freelance, Business, etc.)
- Monthly income summary with trend charts
- Custom income categories

### Investment Tracker
- Country-specific investment options for **9 countries**:
  - 🇮🇳 India — PPF, NSC, Sukanya Samriddhi Yojana, NPS, SCSS, KVP, PMVVY, Post Office MIS/RD, Mutual Funds, Stocks, FDs, EPF, NPS
  - 🇺🇸 USA — 401(k), Roth IRA, Traditional IRA, S&P 500, ETFs, Treasury Bonds, CDs
  - 🇬🇧 UK — ISA, SIPP, Premium Bonds, NS&I, Stocks & Shares ISA
  - 🇦🇺 Australia — Superannuation, ASX Shares, Term Deposits
  - 🇨🇦 Canada — RRSP, TFSA, GICs, CPP
  - 🇩🇪 Germany — Riester-Rente, ETF Sparplan, Tagesgeld
  - 🇸🇬 Singapore — CPF, SRS, SSB, REITs
  - 🇦🇪 UAE — End of Service Gratuity, Gold, Fixed Deposits
  - 🌍 Other — Generic asset types
- Add custom investment types beyond the presets
- Track current value vs. invested amount with returns

### Authentication & Security
- Register and login with email + password
- Passwords hashed with **SHA-256** via Web Crypto API (never stored in plain text)
- Session managed via `sessionStorage` (clears on browser close)
- **Per-user data isolation** — each account's data is completely separate
- Demo account available for quick exploration

### Dashboard
- Net worth snapshot
- Monthly income vs. expenses bar chart
- Category spending donut chart
- Investment portfolio line chart
- Recent transactions list

### Other
- Dark / light mode toggle
- Responsive layout — works on mobile and desktop
- Info tooltips (ⓘ) throughout explaining each field
- Demo data loader to explore with sample data
- Export-ready structure

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | HTML5, CSS3 (custom, no framework) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | [Chart.js 4.4](https://www.chartjs.org/) |
| Fonts | Inter (Google Fonts) |
| Icons | Font Awesome 6.5 |
| Storage | `localStorage` (data) + `sessionStorage` (session) |
| Auth | Web Crypto API — `crypto.subtle.digest('SHA-256')` |
| Hosting | Static — any web server or CDN |

---

## Project Structure

```
budget-expense-tracker/
├── index.html          # Main app shell (protected by auth gate)
├── auth.html           # Login / Register page
├── landing.html        # Marketing landing page
├── css/
│   └── style.css       # All styles + CSS variables for theming
├── js/
│   ├── data.js         # Static data: countries, investment types, categories
│   ├── auth-check.js   # Session guard + logout helper
│   └── app.js          # Full app logic — views, CRUD, charts
├── CHANGELOG.md        # Version history
└── README.md
```

---

## Getting Started

### Run locally

```bash
# Option 1 — npx serve (recommended)
npx serve . -l 3456

# Option 2 — Python
python -m http.server 3456

# Option 3 — VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:3456/landing.html` in your browser.

> **Note:** Must be served over HTTP — opening `index.html` directly as a `file://` URL will block Web Crypto API (SHA-256 hashing requires a secure context).

### First use

1. Open `landing.html` → click **Create Free Account**
2. Register with your name, email, and password
3. You're taken to the app dashboard
4. Optionally load **Demo Data** from Settings to explore with sample data

---

## Data & Privacy

- All data is stored in your **browser's localStorage** — nothing leaves your device
- Each user account's data is stored under a unique key (`budgetApp_data_<userId>`)
- Clearing browser data / localStorage will erase all app data
- There is no cloud sync, no analytics, no tracking

---

## Version History

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

| Version | Date | Summary |
|---|---|---|
| v1.0.0 | 2026-05-01 | Initial release |

---

## License

Personal use. Not for redistribution.
