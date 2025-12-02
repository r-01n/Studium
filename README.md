# Studium

A brutalist productivity suite for students who want their tools to work, not distract.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**🔗 Live Demo:** [studium-suite.vercel.app](https://studium-suite.vercel.app)

## Overview

Studium is an all-in-one productivity platform built for students tired of juggling multiple apps with ads, bloat, and unnecessary features. Born from frustration with fragmented tools that track your data and distract from actual work, Studium bundles everything a student needs into one minimal, local-first application.

**No ads. No tracking. No subscriptions. Just tools that work.**

In use for 2+ months as a daily driver for managing studies, workouts, finances, and habits.

## Philosophy

A tool should do its job well and get out of your way. Studium follows brutalist design principles: function over form, clarity over decoration. It might look soulless to some, but that's the point: the tool isn't the focus, your work is.

## Features

### 📊 Dashboard
Your home base with quick actions, a full calendar view for events, daily statistics at a glance, and an upcoming tasks overview to keep you on track.

### 🍅 Pomodoro Planner
A smart focus timer that goes beyond basic pomodoro. Tell it how long you want to work and your preferred split ratio—it auto-calculates your sessions and lets you plan what you'll tackle in each block. Perfect for marathon study sessions without burnout.

### 💪 Workout Tracker
Track your personal records (PRs), highest reps, and longest times. Built-in timer for tracking sets and rest periods. Progress visualization coming soon via the statistics module.

### ✅ Habits
Daily habit tracking with checkboxes for binary habits and input fields for measurable ones (sleep hours, weight, water intake). Designed to integrate with a fully modular statistics dashboard currently in development.

### 📅 Timetable
Weekly and daily schedule viewer for classes, workouts, planned downtime—anything recurring in your week.

### 📝 Schedule
Event, assignment, and exam management for students who forget everything. Built for those who don't want to sync Google Calendar with their personal life (no data leakage to advertisers). Shows upcoming items automatically in the dashboard.

### 💰 Finance Tracker
Budget tracking designed for newly independent students. Monitor subscriptions, food spending, and other expenses with category splitting and income tracking. Future budget suggestions planned.

### 📈 Statistics (In Development)
Modular, user-customizable analytics dashboard. Currently functional but undergoing redesign for better data visualization across all modules.

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Tailwind CSS** for utility-first styling
- Custom CSS keyframe animations (fade-in, slide-up, scale-in)

### State & Storage
- **localStorage** for client-side persistence
- No backend required (easily portable if needed)
- Data stays on your machine

### Deployment & Analytics
- **Vercel** for hosting
- **Vercel Analytics** for anonymous usage metrics

### Architecture
- **Modular component design** - each module is independently maintained
- **Centralized routing** via App.js with persistent module state
- **Synced data** across modules where relevant

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studium.git

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## Roadmap

### Current Focus
- [ ] Complete statistics module redesign
- [ ] Desktop Pet companion (design in progress)
- [ ] Sound notifications for workout timer
- [ ] Assignment/exam notifications (30min, 1h, 1 day, 1 week before)
- [ ] User-suggested budgeting recommendations
- [ ] Deeper module syncing and data integration

### Future Considerations
- [ ] Offline desktop version (Electron?)
- [ ] Mobile native app (?)
- [ ] Backend...?
- [ ] Advanced performance optimizations

## Why I Built This

I started by building separate tools—a pomodoro timer, workout tracker, and finance tracker—because existing apps were either bloated with features I never used, riddled with ads, or designed to extract and monetize my data. 

Then it hit me: why not bundle everything together? Students already have enough cognitive load without juggling five different apps. Studium is the unified, minimal, privacy-respecting tool I wish existed when I started.

After 2 months of daily use, it's proven its worth. The pomodoro planner especially has transformed how I work. I can grind for hours without burning out because I know exactly what I'm doing in each block, and the pre-planned breaks work well to keep me from being tired.

## Design Philosophy

Studium embraces brutalism: no unnecessary decoration, no gamification gimmicks, no algorithmic engagement tricks. Just clean interfaces that help you get things done.

Work and creation should be the focus.

## Data Privacy

Everything stays local. No server uploads, no third-party tracking, no data mining. Vercel Analytics provides anonymous aggregate metrics, but your actual productivity data never leaves your browser.

## Contributing

This is a personal project, but suggestions and feedback are welcome. Open an issue if you find bugs or have ideas for improvement.

