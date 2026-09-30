# SaveIQ — Google Apps Script & Groq Backend Deployment Guide

This folder contains the complete, production-ready Google Apps Script backend suite for **SaveIQ**.

## 1. Architecture Overview

```
Frontend (SaveIQ Web App)
       │
       ▼
Google Apps Script (Web App / doPost / doGet)
       │
       ├───────────────────┬─────────────────────┐
       ▼                   ▼                     ▼
Google Sheets DB       Groq API (LLaMA 3.3)   Gmail Services
(5 normalized tables)  (AI Coach Engine)      (Automated Alerts)
```

## 2. Setup Steps

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank sheet named `SaveIQ Database`.
2. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<GOOGLE_SHEET_ID>`**`/edit`

### Step 2: Create a Google Apps Script Project
1. Open [script.google.com](https://script.google.com) and click **New Project**. Name it `SaveIQ Backend`.
2. Replace or create the following files in the Apps Script code editor with the code in this directory:
   - `Code.gs`
   - `Database.gs`
   - `AI.gs`
   - `Notifications.gs`
   - `Triggers.gs`
   - `Utils.gs`
   - `appsscript.json` (Project Settings -> enable "Show 'appsscript.json' manifest file in editor")

### Step 3: Configure Script Properties (Environment Variables)
In the Apps Script editor:
1. Click the **Project Settings (gear icon)** on the left sidebar.
2. Scroll down to **Script Properties** and click **Add script property**.
3. Add the following keys:
   - `GOOGLE_SHEET_ID`: Your Google Sheet ID from Step 1.
   - `GROQ_API_KEY`: Your Groq API Key (get free at [console.groq.com](https://console.groq.com/keys)).
   - `APP_URL`: The deployed SaveIQ web application URL.
   - `USER_NOTIFICATION_EMAIL`: Your default alert recipient email address.
   - `USER_CURRENCY`: Default currency symbol (e.g. `₹` or `$`).

### Step 4: Run Initial Database Setup
1. In the Apps Script code editor, select the function `initializeSheetsDatabase` from the dropdown and click **Run**.
2. Authorize Google Sheets permissions when prompted.
3. Open your Google Sheet — you will see the 5 auto-generated tabs:
   - `Users`
   - `Goals`
   - `SavingsTransactions`
   - `Notifications`
   - `AIInsights`

### Step 5: Schedule Daily Financial Audit Trigger
1. In the Apps Script editor, select the function `setupDailyAuditTrigger` and click **Run**.
2. This creates an automated time-driven trigger that runs every morning at 8:00 AM to check upcoming deadlines, overdue goals, and dispatch Gmail alerts!

### Step 6: Deploy as Web App
1. Click **Deploy** -> **New deployment**.
2. Select type: **Web app**.
3. Description: `SaveIQ Production Web API`.
4. **Execute as**: `Me (your Google account)`.
5. **Who has access**: `Anyone`.
6. Click **Deploy** and copy the **Web App URL** (`https://script.google.com/macros/s/.../exec`).
7. Paste this URL into the SaveIQ web app **Settings -> Google Apps Script Sync URL**!
