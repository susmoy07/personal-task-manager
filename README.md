# 📋 TaskFlow — Personal Task Manager

A sleek, modern, and powerful personal task manager with glassmorphic aesthetics, productivity analytics, rich categories, dark mode, keyboard shortcuts, and instant search. Built with vanilla HTML5, CSS3, and JavaScript with zero external dependencies.

---

## ✨ Key Features

- **🚀 Productivity Dashboard**:
  - Live progress bar with completion percentage.
  - Quick-view metrics: Total, Pending, Completed, and Overdue tasks.
  - Batch operations: *Mark All Done*, *Clear Completed*, *Export JSON*, and *Import JSON*.

- **🏷️ Categories & Tags**:
  - Organize tasks into categories: **Work** 💼, **Personal** 🏠, **Study** 📚, **Health** 🏃, **Finance** 💰, and **General** 🎯.
  - Filter tasks by category or status with one click.

- **⚡ Priority Levels & Pinning**:
  - 4 priority tiers: **Low** 🟢, **Medium** 🟡, **High** 🔴, and **Urgent** ⚡.
  - **Star / Pin Tasks**: Pin critical tasks to the top of your list.

- **📅 Smart Due Dates & Presets**:
  - Quick due date preset chips: *Today*, *Tomorrow*, *This Weekend*, and *Next Week (+7d)*.
  - Real-time overdue and today warning badges.
  - Automated sorting by soonest due date, priority, newest, or alphabetical.

- **🔍 Instant Search & Multi-Filters**:
  - Real-time search across task titles, notes, and tags.
  - Status tabs: *All*, *Active*, *Done*, and *Starred*.

- **📝 Task Notes & Editing**:
  - Add detailed notes, links, or sub-task notes to any task.
  - Edit modal to update task titles, notes, categories, priorities, and due dates anytime.

- **🎉 Delightful Micro-Interactions**:
  - Pure Canvas Confetti celebration upon finishing all tasks or hitting 100% completion.
  - Web Audio API pleasant synth chimes upon completing tasks (with mute toggle).
  - Undo deletion snackbar toasts.

- **🌓 Glassmorphic UI & Dark Mode**:
  - High-end glassmorphism design with ambient glowing backdrops.
  - Seamless dark and light theme switching with localStorage persistence.
  - Responsive design optimized for mobile, tablet, and widescreen desktops.

- **⌨️ Keyboard Shortcuts**:
  - <kbd>/</kbd> : Focus search bar
  - <kbd>N</kbd> : Jump to add new task
  - <kbd>D</kbd> : Toggle dark / light mode
  - <kbd>Esc</kbd> : Close modals or clear search
  - <kbd>?</kbd> : Open keyboard shortcuts reference

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup, accessible dialogs, ARIA roles.
- **CSS3**: Custom HSL color variables, Glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, smooth keyframe animations.
- **JavaScript (ES6+)**: Pure vanilla JavaScript, Web Audio API, Canvas 2D API, localStorage persistence.

---

## 📁 Project Structure

```plaintext
personal-task-manager/
├── index.html       # App shell, semantic containers, modals & canvas
├── style.css        # Glassmorphic design system, tokens, and responsive layout
├── script.js        # Core engine, state, audio synth, confetti, and storage
├── .gitignore       # Git ignore rules
└── README.md        # Documentation and guide
```

---

## 🚀 Getting Started

### Option 1: Direct File Open
Open `index.html` directly in any modern browser (Chrome, Safari, Edge, Firefox).

### Option 2: Local Static Server (Recommended)
```bash
# Using Python
python -m http.server 3000

# Or using Node.js
npx serve .
```
Then navigate to `http://localhost:3000`.

---

## 💾 Data Portability
All data is stored offline in your browser's `localStorage`. You can back up or transfer your task list anytime using the built-in **Export JSON** and **Import JSON** buttons.
