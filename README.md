# 📋 Personal Task Manager

A clean, modern, and lightweight personal task management web application built with vanilla HTML, CSS, and JavaScript. Keep track of your daily tasks, set priorities, manage due dates, and switch between light and dark modes with persistent local storage.

---

## ✨ Features

- **📝 Task Management**: Quickly add, complete, and delete tasks.
- **🎯 Priority Levels**: Assign priority tags to tasks with visual color indicators:
  - 🟢 **Low**
  - 🟡 **Medium**
  - 🔴 **High**
- **📅 Due Dates & Overdue Alerts**:
  - Assign optional due dates to tasks.
  - Automatically highlights overdue tasks with warning indicators.
  - Tasks are automatically sorted with the soonest due date first.
- **🔍 Filter Views**: Switch effortlessly between:
  - **All**: View all tasks.
  - **Pending**: View active/uncompleted tasks.
  - **Completed**: View finished tasks.
- **🌓 Dark Mode**: Toggle between light and dark themes with persistent preference.
- **💾 Local Storage Persistence**: All tasks and theme preferences are automatically saved in the browser's `localStorage` so your data persists across page reloads.
- **✨ Polished UI & Micro-interactions**:
  - Smooth task deletion and entrance animations.
  - Input validation shake animation for empty submissions.
  - Responsive layout optimized for desktop, tablet, and mobile screens.
  - Custom SVG icons and typography using Google Fonts (Inter).

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup with ARIA accessibility roles and labels.
- **CSS3**: Custom CSS variables, responsive design (Flexbox & CSS Grid), glassmorphism accents, and smooth transitions.
- **JavaScript (ES6+)**: Pure vanilla JavaScript with no external libraries or framework dependencies.

---

## 📁 Project Structure

```plaintext
personal-task-manager/
├── index.html       # Main HTML markup and app shell
├── style.css        # Design system, theme variables, layout, and animations
├── script.js        # Core logic, DOM manipulation, and localStorage persistence
├── .gitignore       # Git ignore rules
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

No build step or external dependencies are required. You can run the project immediately:

### Option 1: Direct File Open
Simply double-click `index.html` or open it directly in any modern web browser.

### Option 2: Local Static Server (Recommended)
Run a local static server for the best development experience:

**Using Python:**
```bash
# Python 3
python -m http.server 3000
```

**Using Node.js (`serve` or `npx live-server`):**
```bash
npx serve .
# or
npx live-server
```

Then visit `http://localhost:3000` (or the port specified in your terminal).

---

## 📖 Usage Guide

1. **Adding a Task**:
   - Type your task description in the input field.
   - Select a priority level (Low, Medium, High).
   - (Optional) Choose a due date.
   - Click **Add Task** or press <kbd>Enter</kbd>.
2. **Completing a Task**: Click the checkbox next to any task to mark it as complete.
3. **Deleting a Task**: Click the trash icon on any task card.
4. **Filtering Tasks**: Use the filter tabs at the top of the task list to switch between **All**, **Pending**, and **Completed**.
5. **Toggling Dark Mode**: Click the moon/sun icon in the top header to toggle themes.

---

## 🌐 Browser Support

Compatible with all modern web browsers supporting ES6+ and `crypto.randomUUID()`:
- Google Chrome / Chromium
- Mozilla Firefox
- Microsoft Edge
- Apple Safari
