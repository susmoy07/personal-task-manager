/**
 * script.js  —  Personal Task Manager
 *
 * Features:
 *  - Add / delete tasks
 *  - Mark tasks as complete (checkbox → strike-through)
 *  - Priority labels (Low / Medium / High) with colour coding
 *  - Due dates, displayed with overdue highlight, sorted soonest first
 *  - Filter view: All / Pending / Completed
 *  - Dark-mode toggle, preference saved to localStorage
 *  - Full task persistence via localStorage
 */

/* ============================================================
   CONSTANTS & STATE
============================================================ */

/** localStorage keys */
const STORAGE_KEY_TASKS = 'ptm_tasks';
const STORAGE_KEY_THEME = 'ptm_theme';

/** Current filter: 'all' | 'pending' | 'completed' */
let currentFilter = 'all';

/** In-memory task array — each task is an object:
 *  { id, title, priority, dueDate, completed, createdAt }
 */
let tasks = [];


/* ============================================================
   DOM REFERENCES
============================================================ */
const taskInput      = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput   = document.getElementById('due-date');
const addTaskBtn     = document.getElementById('add-task-btn');
const taskList       = document.getElementById('task-list');
const emptyState     = document.getElementById('empty-state');
const taskCount      = document.getElementById('task-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const filterTabs     = document.querySelectorAll('.filter-tab');


/* ============================================================
   INITIALISATION
============================================================ */

/** Called once on page load */
function init() {
  loadTheme();   // restore dark/light preference
  loadTasks();   // restore tasks from localStorage
  renderAll();   // paint the UI
  bindEvents();  // hook up event listeners
}


/* ============================================================
   THEME (DARK / LIGHT MODE)
============================================================ */

/** Apply the saved theme (or default to light) */
function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEY_THEME);
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

/** Toggle dark mode and persist choice */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
}


/* ============================================================
   PERSISTENCE (localStorage)
============================================================ */

/** Load tasks from localStorage into the tasks array */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    // If the stored data is corrupt, start fresh
    console.warn('Could not parse saved tasks. Starting fresh.', e);
    tasks = [];
  }
}

/** Save the current tasks array to localStorage */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}


/* ============================================================
   TASK OPERATIONS
============================================================ */

/**
 * Add a new task from the form inputs.
 * Validates that the title is not empty.
 */
function addTask() {
  const title = taskInput.value.trim();

  // Basic validation — title is required
  if (!title) {
    // Shake the input to give visual feedback
    taskInput.classList.add('shake');
    taskInput.addEventListener('animationend', () => {
      taskInput.classList.remove('shake');
    }, { once: true });
    taskInput.focus();
    return;
  }

  // Build a new task object
  const newTask = {
    id:        crypto.randomUUID(),       // unique ID
    title,
    priority:  prioritySelect.value,      // 'low' | 'medium' | 'high'
    dueDate:   dueDateInput.value || null, // 'YYYY-MM-DD' or null
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks();

  // Clear the form (keep priority selection as a convenience)
  taskInput.value   = '';
  dueDateInput.value = '';
  taskInput.focus();

  // Quick pulse on button for feedback
  addTaskBtn.classList.add('pulse');
  addTaskBtn.addEventListener('animationend', () => {
    addTaskBtn.classList.remove('pulse');
  }, { once: true });

  renderAll();
}

/**
 * Toggle the completed state of a task by its ID.
 * @param {string} id
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderAll();
}

/**
 * Delete a task by its ID, with a slide-out animation.
 * @param {string} id
 * @param {HTMLElement} itemEl  — the <li> DOM element
 */
function deleteTask(id, itemEl) {
  // Add removing class to trigger CSS animation
  itemEl.classList.add('removing');

  // Wait for animation to finish before splicing from array
  itemEl.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
  }, { once: true });
}


/* ============================================================
   SORTING
============================================================ */

/**
 * Sort tasks by soonest due date first.
 * Tasks without a due date go to the bottom.
 * Among same-date tasks, not-completed come before completed.
 * @param {Array} list
 * @returns {Array}
 */
function sortByDueDate(list) {
  return [...list].sort((a, b) => {
    // No due date → push to end
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return  1;
    if (!b.dueDate) return -1;

    // Compare ISO date strings lexicographically (safe for YYYY-MM-DD)
    if (a.dueDate < b.dueDate) return -1;
    if (a.dueDate > b.dueDate) return  1;
    return 0;
  });
}


/* ============================================================
   RENDERING
============================================================ */

/** Re-render everything: task list + empty state + count badge */
function renderAll() {
  // Filter tasks based on the current tab
  let filtered;
  if (currentFilter === 'pending') {
    filtered = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = tasks.filter(t =>  t.completed);
  } else {
    filtered = [...tasks];
  }

  // Sort by due date
  const sorted = sortByDueDate(filtered);

  // Clear the list
  taskList.innerHTML = '';

  if (sorted.length === 0) {
    // Show empty state, hide list
    emptyState.classList.remove('hidden');
    taskList.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    taskList.classList.remove('hidden');
    sorted.forEach(task => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  // Update count badge (always reflect total, not filtered)
  const total     = tasks.length;
  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} of ${total} remaining`;
}

/**
 * Build and return an <li> element for a given task.
 * @param {Object} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.priority = task.priority;
  li.dataset.id       = task.id;

  // ── Checkbox ───────────────────────────────────────────
  const checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked   = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
  checkbox.addEventListener('change', () => toggleComplete(task.id));

  // ── Content group ──────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'task-content';

  // Task title
  const titleEl = document.createElement('span');
  titleEl.className   = 'task-title';
  titleEl.textContent = task.title;

  // Meta row (priority badge + due date)
  const metaRow = document.createElement('div');
  metaRow.className = 'task-meta';

  // Priority badge
  const badge = document.createElement('span');
  badge.className   = `priority-badge ${task.priority}`;
  badge.textContent = capitalise(task.priority);

  metaRow.appendChild(badge);

  // Due date label (if set)
  if (task.dueDate) {
    const dateLabel = document.createElement('span');
    dateLabel.className = 'due-date-label';

    // Check if overdue (only for pending tasks)
    const isOverdue = !task.completed && isDateOverdue(task.dueDate);
    if (isOverdue) dateLabel.classList.add('overdue');

    // Calendar icon
    dateLabel.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
      ${isOverdue ? '⚠ Overdue · ' : ''}${formatDate(task.dueDate)}
    `;

    metaRow.appendChild(dateLabel);
  }

  content.appendChild(titleEl);
  content.appendChild(metaRow);

  // ── Delete button ──────────────────────────────────────
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

  // Assemble the list item
  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(deleteBtn);

  return li;
}


/* ============================================================
   HELPERS
============================================================ */

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a YYYY-MM-DD date string into a human-friendly form
 * e.g. "Aug 15, 2025".
 * @param {string} isoDate  — 'YYYY-MM-DD'
 * @returns {string}
 */
function formatDate(isoDate) {
  // Parse as UTC noon to avoid timezone shifts
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d); // local date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/**
 * Return true if the given YYYY-MM-DD date is in the past (before today).
 * @param {string} isoDate
 * @returns {boolean}
 */
function isDateOverdue(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time
  const [y, m, d] = isoDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  return due < today;
}


/* ============================================================
   EVENT BINDING
============================================================ */

function bindEvents() {
  // Add task via button click
  addTaskBtn.addEventListener('click', addTask);

  // Add task via Enter key in the title input
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Dark mode toggle
  darkModeToggle.addEventListener('click', toggleTheme);

  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab styling
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update filter state and re-render
      currentFilter = tab.dataset.filter;
      renderAll();
    });
  });
}


/* ============================================================
   ADD A SHAKE KEYFRAME (for invalid-input feedback)
   — injected so the CSS file stays clean
============================================================ */
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .shake { animation: shake 350ms ease; border-color: var(--clr-high) !important; }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   BOOT
============================================================ */
init();
