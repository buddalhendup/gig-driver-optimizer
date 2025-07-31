# Gig Driver Optimization Tool

This project provides a web‑based productivity tool for independent delivery drivers working for platforms such as **Uber&nbsp;Eats**, **Spark Driver**, **DoorDash**, **GoPuff** and similar gig services.  It helps maximize earnings by assisting with order selection, route optimization, expense tracking and more.

## Features

- **Order Selection Assistant** – Enter orders from any platform (pick‑up and drop‑off addresses, pay, miles and estimated time).  The tool calculates pay per mile and pay per hour and ranks orders so you can quickly choose the most profitable deliveries.  Orders meeting your alert threshold are highlighted.
- **Real‑Time Earnings Maximizer** – Accepted orders are summed and visualized in real time on the dashboard.  Summary charts show total earnings by day and by platform.
- **Route Optimization Tool** – For accepted orders, the tool can compute an optimized driving route using the Mapbox Directions API.  Enter your own Mapbox access token in the **Settings** section to enable this feature.  The resulting route is displayed on an interactive map along with distance and travel‑time estimates.
- **Offer Alert System** – Set a minimum dollars‑per‑mile threshold in **Settings**.  Orders meeting or exceeding this threshold are highlighted in green.
- **Earnings & Analytics Dashboard** – Dynamic charts powered by Chart.js present your earnings data.  A bar chart displays total earnings by day and a pie chart shows earnings by platform.
- **Multi‑App Order Management** – Manage orders from multiple apps in one place.  Accept or unaccept orders with a single click and track their status.
- **Expense and Tax Tracker** – Log expenses (fuel, maintenance, parking, tolls, etc.).  A summary of total expenses is shown to help estimate net earnings and plan for taxes.
- **Shift & Schedule Planner** – Schedule your shifts by date and time to plan when you’ll be online.  Shifts are stored locally for quick reference.
- **Settings** – Store your Mapbox access token and set an offer alert threshold.  All data is saved in your browser’s local storage.

## Getting Started

### Clone or Download

You can either clone this repository via Git or download it as a ZIP file:

```sh
git clone https://github.com/your‑username/gig‑driver-optimizer.git
```

or click **Code > Download ZIP** and extract it.

### Running Locally

No special tooling is required; everything runs in the browser:

1. Open `index.html` in your web browser.  You may see a prompt that local pages cannot load external resources; if so, serve the folder with a simple HTTP server (e.g. `python -m http.server`) and navigate to `http://localhost:8000`.
2. Begin entering your orders, expenses and shifts.  The data will persist in your browser’s local storage.
3. To enable the map and routing functionality, obtain a free Mapbox access token:
   - Create an account at <https://account.mapbox.com/auth/signup/>.
   - Copy your **access token** from the dashboard.
   - In the **Settings** section of the app, paste your token into the *Mapbox Access Token* field and click **Save Settings**.
4. (Optional) Set your preferred dollars‑per‑mile alert threshold in **Settings**.  Orders meeting or exceeding this threshold will be highlighted.

### Deploying on GitHub Pages

You can host the application for free using GitHub Pages:

1. Fork or push this repository to your own GitHub account.
2. Navigate to the repository’s **Settings** → **Pages** (or **Pages** under “Code and automation” depending on the UI).
3. Under **Source**, select the branch (usually `main`) and the root folder (`/`), then click **Save**.
4. GitHub will publish your site at `https://<your‑username>.github.io/<repository‑name>/` within a few minutes.
5. Anyone can then access your Gig Driver tool via that URL, including on mobile devices.

### File Structure

- `index.html` – Main HTML file that lays out the user interface.
- `style.css` – Custom styles that complement the minimal CSS framework.
- `script.js` – Contains all of the application’s client‑side logic: data management, charts, routing and event handlers.
- `README.md` – This document.

## Maintenance & Updates

Because the application is built with plain HTML, CSS and JavaScript and runs entirely in the browser, updating it is straightforward:

1. Make changes to any of the files (e.g. add new features in `script.js`).
2. Commit and push the changes to your GitHub repository.
3. GitHub Pages will automatically update your live site.

If you would like to clear your saved data (orders, expenses, shifts), simply clear your browser’s local storage for the site in your browser settings.

## Disclaimer

This tool is provided as a convenience for independent gig workers.  It does not connect to gig platforms directly; instead, you manually enter order data.  The earnings calculations and routing suggestions are estimates intended for informational purposes only.  Always follow the terms of service of your gig platforms and exercise your own judgment when accepting orders.

---

*Built in July 2025 with ❤️ for gig drivers.*