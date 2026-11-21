# 🌱 My Internship Planter

**Live site:** [internship-planter.vercel.app](https://internship-planter.vercel.app/)

My Internship Planter is a career-growth app for interns. It brings task tracking, career journaling, interview prep and intern networking together in one place, built around a plant that grows as you make progress through your internship.

Every completed task waters your plant, every journal entry feeds it, and by week 12 it bears fruit: STAR stories you can take into future interviews. All graphics in the app are hand-illustrated.

<!-- SCREENSHOT: Hero image of the dashboard. Save as docs/screenshots/dashboard.png -->
![Dashboard](docs/screenshots/dashboard.png)

---

## Table of contents

- [Try it out](#try-it-out)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)

---

## Try it out

No download needed. Open **[internship-planter.vercel.app](https://internship-planter.vercel.app/)**, then:

1. Type a username and password (at least 6 characters) and click **Make an Account**.
2. Check off tasks on the **Dashboard** to earn water, and save a **Journal** entry to earn plant food.
3. Visit the **Intern Hub** to set up your profile and meet other interns.
4. Use the week arrows to jump to **week 12** and unlock **Fruits of Your Labor**.

---

## Features

### 🪴 Dashboard
- **12-week progress tracker** with arrows to move between weeks. The plant illustration grows through 12 stages as the internship goes on.
- **Plant health** that drops a little each day, so steady check-ins matter.
- **Rewards:** completing internship tasks earns water (+5% health), and saving a journal entry earns plant food (restores health to 100%).
- **Internship task checklist** covering milestones like orientation, coffee with your supervisor, collaboration days and the capstone presentation.
- **Daily to-do note** that clears itself each morning.
- **Demo date control** to fast-forward days when presenting the app.

### 📓 Journal
- **Guided prompts** that change every two weeks, from first impressions in week 1 to takeaways in week 12.
- **Free-write entries** for anything outside the prompts.
- **Rich text editing:** bold, italic, underline and links.
- **Attachments:** up to 3 images or files per entry, with resizable images.
- **Past entries** list to reopen, edit or delete earlier entries.

### 🌷 Intern Hub
- **Intern garden:** every intern appears as a potted flower they choose.
- **Profiles** with a bio, hobbies, LinkedIn link, and favorite movies, books and albums, searched live from TMDB, Google Books and iTunes.
- **Helpful intern links** to calendars, IT help, maps and learning resources.

### 🍎 Fruits of Your Labor (week 12)
- Unlocks at the end of the internship.
- Each apple is a **STAR story** (Situation, Task, Action, Result) tied to a skill such as teamwork, leadership or problem solving.
- Finished stories earn a gold star and become ready-made answers for behavioral interviews.

### 🔐 Accounts
- Sign up and log in with a username and password.
- Journals, STAR stories and profiles are saved to the cloud and follow you across devices.

---

## Screenshots

<!-- Add screenshots to docs/screenshots/ using the file names below. -->

### Login
<!-- SCREENSHOT: Login page. Save as docs/screenshots/login.png -->
![Login page](docs/screenshots/login.png)

### Dashboard
<!-- SCREENSHOT: Dashboard with plant, tasks and to-do note. Save as docs/screenshots/dashboard.png -->
![Dashboard](docs/screenshots/dashboard.png)

### Journal
<!-- SCREENSHOT: Journal editor with a prompt and past entries. Save as docs/screenshots/journal.png -->
![Journal](docs/screenshots/journal.png)

### Intern Hub
<!-- SCREENSHOT: Intern garden and a profile. Save as docs/screenshots/intern-hub.png -->
![Intern Hub](docs/screenshots/intern-hub.png)

### Profile editor
<!-- SCREENSHOT: Editing a profile with favorite movies, books and albums. Save as docs/screenshots/profile-editor.png -->
![Profile editor](docs/screenshots/profile-editor.png)

### Fruits of Your Labor
<!-- SCREENSHOT: Apple orchard and the STAR story editor. Save as docs/screenshots/fruits.png -->
![Fruits of Your Labor](docs/screenshots/fruits.png)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) with row-level security |
| Hosting | Vercel |
| Outside APIs | TMDB (movies), Google Books (books), iTunes Search (albums) |

---

## How it works

```
Browser (React app on Vercel)
        │
        │  supabase-js
        ▼
Supabase
  ├── Auth        → accounts and login sessions
  └── PostgreSQL  → profiles, journals, stars tables
```

There's no separate backend server. The React app talks to Supabase directly using a public key, and **row-level security (RLS)** policies in the database decide what each signed-in user can read and write:

- **`profiles`:** any signed-in intern can view profiles (for the Intern Hub), but each user can only edit their own.
- **`journals`** and **`stars`:** private. Each user can only read and write their own rows.

Usernames are turned into placeholder emails behind the scenes (`username@example.com`) because Supabase Auth signs users in by email. Users only ever see and type their username.

Weekly progress, plant health, tasks and to-dos are saved in the browser's local storage.

---

## Deployment

The app is live on **Vercel** at **[internship-planter.vercel.app](https://internship-planter.vercel.app/)**.

- Vercel builds the app with `npm run build` and serves the `dist` folder.
- Every push to the main branch deploys a new version automatically.
- The Supabase URL and public key are stored as Vercel environment variables, so no keys live in the code.
- `vercel.json` sends every route to `index.html`, so React handles navigation and page refreshes.

---

## Project structure

```
internship-planter/
├── public/              # Static files
├── src/
│   ├── assets/          # Hand-drawn illustrations (plant stages, apples, tools)
│   ├── App.jsx          # Main app: pages, components and Supabase data logic
│   ├── App.css          # App styles
│   ├── index.css        # Global styles
│   ├── main.jsx         # React entry point
│   └── supabase.js      # Supabase client setup
├── docs/
│   └── screenshots/     # README screenshots
├── index.html
├── package.json
├── vercel.json          # Vercel routing
└── vite.config.js
```

---

## Roadmap

- 🖥️ **Desktop plant companion:** a virtual plant that sits on your desktop and keeps progress visible throughout the workday.
- ☁️ **Sync all progress to the cloud,** including weeks, plant health, tasks and to-dos, so everything follows you across devices.
- 🤖 **AI journaling help** with the Claude API, such as feedback on STAR stories and personalized prompts.

---

## Author

Designed, illustrated and built by **Sasya Reddy**.
