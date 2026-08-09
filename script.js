/**
 * script.js — Personal Task Manager (TaskFlow)
 * Modern, Feature-Rich Vanilla JavaScript Engine
 */

/* ============================================================
   CONSTANTS & STATE
============================================================ */
const STORAGE_KEY_TASKS = 'ptm_tasks_v2';
const STORAGE_KEY_THEME = 'ptm_theme';
const STORAGE_KEY_SOUND = 'ptm_sound';

// State
let tasks = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'dueDate';
let searchQuery = '';
let soundEnabled = true;
let undoStack = [];

// Sample Demo Tasks
const SAMPLE_TASKS = [
  {
    id: crypto.randomUUID(),
    title: 'Complete project sprint goals',
    notes: 'Review code pull requests and deploy release build to staging.',
    priority: 'urgent',
    category: 'work',
    dueDate: getRelativeDateString(0), // Today
    pinned: true,
    completed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: 'Morning 5km jog & hydration',
    notes: 'Keep heart rate in zone 2, drink electrolyte water after.',
    priority: 'high',
    category: 'health',
    dueDate: getRelativeDateString(0), // Today
    pinned: false,
    completed: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: 'Read System Design & Architecture Chapter 4',
    notes: 'Focus on distributed caching and database indexing strategies.',
    priority: 'medium',
    category: 'study',
    dueDate: getRelativeDateString(1), // Tomorrow
    pinned: false,
    completed: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: 'Review monthly budget and investment portfolio',
    notes: 'Check retirement contributions and utility subscriptions.',
    priority: 'medium',
    category: 'finance',
    dueDate: getRelativeDateString(4),
    pinned: false,
    completed: false,
    createdAt: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: 'Weekly grocery restock & meal prep',
    notes: 'Fresh veggies, oats, Greek yogurt, almond milk, and salmon.',
    priority: 'low',
    category: 'personal',
    dueDate: getRelativeDateString(6),
    pinned: false,
    completed: false,
    createdAt: new Date(Date.now() - 36000000).toISOString()
  }
];

/* ============================================================
   DOM ELEMENTS
============================================================ */
// Header & Global
const headerGreeting      = document.getElementById('header-greeting');
const headerDate          = document.getElementById('header-date');
const darkModeToggle      = document.getElementById('dark-mode-toggle');
const iconMoon            = darkModeToggle.querySelector('.icon-moon');
const iconSun             = darkModeToggle.querySelector('.icon-sun');
const soundToggleBtn      = document.getElementById('sound-toggle-btn');
const iconSoundOn         = soundToggleBtn.querySelector('.icon-sound-on');
const iconSoundOff        = soundToggleBtn.querySelector('.icon-sound-off');
const shortcutsBtn        = document.getElementById('shortcuts-btn');

// Progress & Metrics
const progressPercent     = document.getElementById('progress-percent');
const progressFraction    = document.getElementById('progress-fraction');
const progressBarFill     = document.getElementById('progress-bar-fill');
const progressBarContainer= document.getElementById('progress-bar-container');
const countTotal          = document.getElementById('count-total');
const countPending        = document.getElementById('count-pending');
const countCompleted      = document.getElementById('count-completed');
const countOverdue        = document.getElementById('count-overdue');
const markAllDoneBtn      = document.getElementById('mark-all-done-btn');
const clearCompletedBtn   = document.getElementById('clear-completed-btn');
const exportBtn           = document.getElementById('export-btn');
const importFileInput     = document.getElementById('import-file-input');

// Task Input Form
const taskInput           = document.getElementById('task-input');
const taskNotes           = document.getElementById('task-notes');
const notesContainer      = document.getElementById('notes-container');
const toggleNotesBtn      = document.getElementById('toggle-notes-btn');
const prioritySelect      = document.getElementById('priority-select');
const categorySelect      = document.getElementById('category-select');
const dueDateInput        = document.getElementById('due-date');
const datePresetChips     = document.querySelectorAll('.date-preset-chip');
const clearDateChip       = document.getElementById('clear-date-chip');
const addTaskBtn          = document.getElementById('add-task-btn');

// Search & Filters
const searchInput         = document.getElementById('search-input');
const clearSearchBtn      = document.getElementById('clear-search-btn');
const filterTabs          = document.querySelectorAll('.filter-tab');
const filterCategorySelect= document.getElementById('filter-category');
const sortSelect          = document.getElementById('sort-select');

// Task List & Empty State
const taskList            = document.getElementById('task-list');
const emptyState          = document.getElementById('empty-state');
const emptyTitle          = document.getElementById('empty-title');
const emptyDesc           = document.getElementById('empty-desc');
const loadSamplesBtn      = document.getElementById('load-samples-btn');

// Edit Modal
const editModal           = document.getElementById('edit-modal');
const editTaskForm        = document.getElementById('edit-task-form');
const editTaskId          = document.getElementById('edit-task-id');
const editTaskTitle       = document.getElementById('edit-task-title');
const editTaskNotes       = document.getElementById('edit-task-notes');
const editTaskPriority    = document.getElementById('edit-task-priority');
const editTaskCategory    = document.getElementById('edit-task-category');
const editTaskDue         = document.getElementById('edit-task-due');
const closeEditModalBtn   = document.getElementById('close-edit-modal-btn');
const cancelEditBtn       = document.getElementById('cancel-edit-btn');

// Shortcuts Modal
const shortcutsModal      = document.getElementById('shortcuts-modal');
const closeShortcutsModalBtn = document.getElementById('close-shortcuts-modal-btn');
const footerShortcutsLink = document.getElementById('footer-shortcuts-link');
const footerResetLink     = document.getElementById('footer-reset-link');

// Toast Container & Canvas
const toastContainer      = document.getElementById('toast-container');
const confettiCanvas      = document.getElementById('confetti-canvas');

/* ============================================================
   INITIALIZATION
============================================================ */
function init() {
  initDateAndGreeting();
  loadPreferences();
  loadTasks();
  bindEvents();
  render();
}

/* ============================================================
   DATE & GREETING
============================================================ */
function initDateAndGreeting() {
  const now = new Date();
  const hours = now.getHours();

  let greeting = 'Welcome back';
  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning ☀️';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon 🌤️';
  } else if (hours >= 17 && hours < 22) {
    greeting = 'Good evening 🌙';
  } else {
    greeting = 'Night owl hours ✨';
  }
  headerGreeting.textContent = greeting;

  // Format header date (e.g., Sun, Aug 10)
  headerDate.textContent = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function getRelativeDateString(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ============================================================
   THEME & SOUND PREFERENCES
============================================================ */
function loadPreferences() {
  // Theme
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  applyTheme(isDark);

  // Sound
  const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
  soundEnabled = savedSound !== 'false';
  applySoundUI();
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  if (isDark) {
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
  } else {
    iconMoon.classList.remove('hidden');
    iconSun.classList.add('hidden');
  }
}

function toggleTheme() {
  const isDark = !document.body.classList.contains('dark-mode');
  applyTheme(isDark);
  localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled', 'info');
}

function applySoundUI() {
  if (soundEnabled) {
    iconSoundOn.classList.remove('hidden');
    iconSoundOff.classList.add('hidden');
  } else {
    iconSoundOn.classList.add('hidden');
    iconSoundOff.classList.remove('hidden');
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled);
  applySoundUI();
  showToast(soundEnabled ? 'Sound effects on' : 'Sound effects muted', 'info');
}

/* ============================================================
   WEB AUDIO API SOUND GENERATOR
============================================================ */
function playCompletionSound() {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.12);        // C5
    playTone(659.25, now + 0.08, 0.18); // E5
    playTone(783.99, now + 0.16, 0.28); // G5
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

/* ============================================================
   STORAGE
============================================================ */
function loadTasks() {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_TASKS);
    if (rawV2) {
      tasks = JSON.parse(rawV2);
    } else {
      // Check legacy key for migration
      const rawLegacy = localStorage.getItem('ptm_tasks');
      if (rawLegacy) {
        const legacyTasks = JSON.parse(rawLegacy);
        tasks = legacyTasks.map(t => ({
          id: t.id || crypto.randomUUID(),
          title: t.title || 'Untitled Task',
          notes: t.notes || '',
          priority: t.priority || 'medium',
          category: t.category || 'general',
          dueDate: t.dueDate || null,
          pinned: !!t.pinned,
          completed: !!t.completed,
          createdAt: t.createdAt || new Date().toISOString()
        }));
        saveTasks();
      } else {
        // Load default sample tasks for new users
        tasks = [...SAMPLE_TASKS];
        saveTasks();
      }
    }
  } catch (e) {
    console.error('Error loading tasks from storage', e);
    tasks = [...SAMPLE_TASKS];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks to storage', e);
    showToast('Failed to save to localStorage', 'warn');
  }
}

/* ============================================================
   TASK OPERATIONS
============================================================ */
function addTask() {
  const title = taskInput.value.trim();
  const notes = taskNotes.value.trim();

  if (!title) {
    taskInput.classList.add('shake');
    taskInput.addEventListener('animationend', () => taskInput.classList.remove('shake'), { once: true });
    taskInput.focus();
    showToast('Please enter a task title', 'warn');
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title,
    notes,
    priority: prioritySelect.value,
    category: categorySelect.value,
    dueDate: dueDateInput.value || null,
    pinned: false,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();

  // Reset inputs
  taskInput.value = '';
  taskNotes.value = '';
  dueDateInput.value = '';
  clearDateSelection();
  notesContainer.classList.add('hidden');
  toggleNotesBtn.querySelector('span').textContent = '+ Add Notes';
  taskInput.focus();

  render();
  showToast('Task added successfully!', 'success');
}

function toggleTaskComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const wasCompleted = task.completed;
  task.completed = !task.completed;
  saveTasks();

  if (!wasCompleted) {
    playCompletionSound();
    checkAllTasksCelebration();
  }

  render();
}

function toggleTaskPin(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.pinned = !task.pinned;
  saveTasks();
  render();
  showToast(task.pinned ? 'Task pinned to top ⭐' : 'Task unpinned', 'info');
}

function deleteTask(id, element) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  const deletedTask = tasks[index];
  undoStack.push({ task: deletedTask, index });

  if (element) {
    element.classList.add('removing');
    element.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
      showToast('Task deleted', 'info', true);
    }, { once: true });
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    showToast('Task deleted', 'info', true);
  }
}

function undoLastDelete() {
  if (undoStack.length === 0) return;
  const { task, index } = undoStack.pop();
  tasks.splice(Math.min(index, tasks.length), 0, task);
  saveTasks();
  render();
  showToast('Task restored!', 'success');
}

function markAllDone() {
  const activeTasks = tasks.filter(t => !t.completed);
  if (activeTasks.length === 0) {
    showToast('All tasks are already completed!', 'info');
    return;
  }
  tasks.forEach(t => t.completed = true);
  saveTasks();
  render();
  playCompletionSound();
  launchConfetti();
  showToast(`Marked ${activeTasks.length} tasks as complete!`, 'success');
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
  showToast(`Cleared ${completedCount} completed tasks`, 'info');
}

/* ============================================================
   EDIT TASK MODAL
============================================================ */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskNotes.value = task.notes || '';
  editTaskPriority.value = task.priority;
  editTaskCategory.value = task.category;
  editTaskDue.value = task.dueDate || '';

  editModal.classList.remove('hidden');
  editTaskTitle.focus();
}

function closeEditModal() {
  editModal.classList.add('hidden');
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const id = editTaskId.value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const title = editTaskTitle.value.trim();
  if (!title) return;

  task.title = title;
  task.notes = editTaskNotes.value.trim();
  task.priority = editTaskPriority.value;
  task.category = editTaskCategory.value;
  task.dueDate = editTaskDue.value || null;

  saveTasks();
  closeEditModal();
  render();
  showToast('Task updated successfully!', 'success');
}

/* ============================================================
   IMPORT & EXPORT JSON
============================================================ */
function exportTasks() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `taskflow-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Tasks exported to JSON file!', 'success');
}

function importTasks(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        tasks = imported.map(t => ({
          id: t.id || crypto.randomUUID(),
          title: t.title || 'Untitled Task',
          notes: t.notes || '',
          priority: t.priority || 'medium',
          category: t.category || 'general',
          dueDate: t.dueDate || null,
          pinned: !!t.pinned,
          completed: !!t.completed,
          createdAt: t.createdAt || new Date().toISOString()
        }));
        saveTasks();
        render();
        showToast(`Imported ${tasks.length} tasks successfully!`, 'success');
      } else {
        showToast('Invalid JSON file format', 'warn');
      }
    } catch (err) {
      showToast('Failed to parse JSON file', 'warn');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reset file input
}

/* ============================================================
   SORTING & FILTERING
============================================================ */
function getFilteredAndSortedTasks() {
  return tasks
    .filter(task => {
      // 1. Status Filter
      if (currentFilter === 'pending' && task.completed) return false;
      if (currentFilter === 'completed' && !task.completed) return false;
      if (currentFilter === 'starred' && !task.pinned) return false;

      // 2. Category Filter
      if (currentCategory !== 'all' && task.category !== currentCategory) return false;

      // 3. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const notesMatch = task.notes && task.notes.toLowerCase().includes(query);
        const catMatch   = task.category && task.category.toLowerCase().includes(query);
        if (!titleMatch && !notesMatch && !catMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned tasks always stay on top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Non-completed come before completed
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      // Primary sorting
      if (currentSort === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (currentSort === 'priority') {
        const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      } else if (currentSort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (currentSort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
}

/* ============================================================
   RENDERING
============================================================ */
function render() {
  updateDashboardProgress();

  const filteredTasks = getFilteredAndSortedTasks();
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    taskList.classList.add('hidden');

    if (searchQuery) {
      emptyTitle.textContent = 'No matching tasks found';
      emptyDesc.textContent = `Try searching for something else or clearing the search filter.`;
      loadSamplesBtn.classList.add('hidden');
    } else if (currentFilter === 'starred') {
      emptyTitle.textContent = 'No starred tasks';
      emptyDesc.textContent = 'Click the star icon on any task to pin it here.';
      loadSamplesBtn.classList.add('hidden');
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks yet';
      emptyDesc.textContent = 'Keep working through your list and check them off!';
      loadSamplesBtn.classList.add('hidden');
    } else if (tasks.length === 0) {
      emptyTitle.textContent = 'Your task list is empty!';
      emptyDesc.textContent = 'Add a new task above or load the sample tasks to get started.';
      loadSamplesBtn.classList.remove('hidden');
    } else {
      emptyTitle.textContent = 'All caught up!';
      emptyDesc.textContent = 'No active tasks found in this view.';
      loadSamplesBtn.classList.add('hidden');
    }
  } else {
    emptyState.classList.add('hidden');
    taskList.classList.remove('hidden');
    filteredTasks.forEach(task => {
      taskList.appendChild(createTaskElement(task));
    });
  }
}

function updateDashboardProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(t => !t.completed && isDateOverdue(t.dueDate)).length;

  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressPercent.textContent = `${pct}% Completed`;
  progressFraction.textContent = `${completed} of ${total} done`;
  progressBarFill.style.width = `${pct}%`;
  progressBarContainer.setAttribute('aria-valuenow', pct);

  countTotal.textContent = total;
  countPending.textContent = pending;
  countCompleted.textContent = completed;
  countOverdue.textContent = overdue;
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}${task.pinned ? ' pinned' : ''}`;
  li.dataset.priority = task.priority;
  li.dataset.id = task.id;

  // Custom Checkbox
  const checkboxBtn = document.createElement('button');
  checkboxBtn.type = 'button';
  checkboxBtn.className = 'checkbox-btn';
  checkboxBtn.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
  checkboxBtn.innerHTML = `
    <svg class="checkbox-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `;
  checkboxBtn.addEventListener('click', () => toggleTaskComplete(task.id));

  // Star / Pin Button
  const starBtn = document.createElement('button');
  starBtn.type = 'button';
  starBtn.className = `star-btn${task.pinned ? ' starred' : ''}`;
  starBtn.title = task.pinned ? 'Unpin task' : 'Pin task to top';
  starBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="${task.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  `;
  starBtn.addEventListener('click', () => toggleTaskPin(task.id));

  // Content Wrapper
  const content = document.createElement('div');
  content.className = 'task-content';

  // Task Title
  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;
  content.appendChild(title);

  // Optional Notes Preview
  if (task.notes) {
    const notesPreview = document.createElement('p');
    notesPreview.className = 'task-notes-preview';
    notesPreview.textContent = task.notes;
    content.appendChild(notesPreview);
  }

  // Meta Badges (Priority, Category, Due Date)
  const meta = document.createElement('div');
  meta.className = 'task-meta';

  // Priority Badge
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `priority-badge ${task.priority}`;
  priorityBadge.textContent = `${getPriorityIcon(task.priority)} ${capitalize(task.priority)}`;
  meta.appendChild(priorityBadge);

  // Category Badge
  if (task.category) {
    const catBadge = document.createElement('span');
    catBadge.className = `category-badge ${task.category}`;
    catBadge.textContent = `${getCategoryIcon(task.category)} ${capitalize(task.category)}`;
    meta.appendChild(catBadge);
  }

  // Due Date Badge
  if (task.dueDate) {
    const dueBadge = document.createElement('span');
    dueBadge.className = 'due-badge';

    const isOverdue = !task.completed && isDateOverdue(task.dueDate);
    const isToday = !task.completed && isDateToday(task.dueDate);

    if (isOverdue) dueBadge.classList.add('overdue');
    if (isToday) dueBadge.classList.add('today');

    dueBadge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      ${isOverdue ? '⚠️ Overdue · ' : isToday ? '📅 Today · ' : ''}${formatDate(task.dueDate)}
    `;
    meta.appendChild(dueBadge);
  }

  content.appendChild(meta);

  // Actions Container (Edit & Delete)
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn action-btn--edit';
  editBtn.title = 'Edit task';
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  `;
  editBtn.addEventListener('click', () => openEditModal(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn action-btn--delete';
  deleteBtn.title = 'Delete task';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  `;
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  // Assemble List Item
  li.appendChild(checkboxBtn);
  li.appendChild(starBtn);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

/* ============================================================
   HELPERS & FORMATTERS
============================================================ */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPriorityIcon(priority) {
  switch (priority) {
    case 'urgent': return '⚡';
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'work': return '💼';
    case 'personal': return '🏠';
    case 'study': return '📚';
    case 'health': return '🏃';
    case 'finance': return '💰';
    case 'general': return '🎯';
    default: return '📁';
  }
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

function isDateOverdue(isoDate) {
  if (!isoDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = isoDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  return due < today;
}

function isDateToday(isoDate) {
  if (!isoDate) return false;
  const today = new Date();
  const [y, m, d] = isoDate.split('-').map(Number);
  return (
    today.getFullYear() === y &&
    today.getMonth() === m - 1 &&
    today.getDate() === d
  );
}

function clearDateSelection() {
  datePresetChips.forEach(chip => chip.classList.remove('active'));
  clearDateChip.classList.add('hidden');
}

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
function showToast(message, type = 'info', allowUndo = false) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (allowUndo && undoStack.length > 0) {
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'toast-undo-btn';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => {
      undoLastDelete();
      toast.remove();
    });
    toast.appendChild(undoBtn);
  }

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, allowUndo ? 5000 : 3000);
}

/* ============================================================
   CONFETTI CELEBRATION ENGINE (Pure Canvas)
============================================================ */
function checkAllTasksCelebration() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  if (total > 0 && total === completed) {
    launchConfetti();
    showToast('🎉 All tasks completed! Amazing job!', 'success');
  }
}

function launchConfetti() {
  const canvas = confettiCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#eab308', '#06b6d4', '#f97316'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 200 - 100),
      y: canvas.height * 0.45 + (Math.random() * 100 - 50),
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      gravity: 0.35,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  updateConfetti();
}

/* ============================================================
   EVENT BINDINGS
============================================================ */
function bindEvents() {
  // Add task events
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Toggle Notes
  toggleNotesBtn.addEventListener('click', () => {
    const isHidden = notesContainer.classList.toggle('hidden');
    toggleNotesBtn.querySelector('span').textContent = isHidden ? '+ Add Notes' : '- Hide Notes';
    if (!isHidden) taskNotes.focus();
  });

  // Date Preset Chips
  datePresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const preset = chip.dataset.preset;
      let dateVal = '';

      if (preset === 'today') {
        dateVal = getRelativeDateString(0);
      } else if (preset === 'tomorrow') {
        dateVal = getRelativeDateString(1);
      } else if (preset === 'weekend') {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
        const diff = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
        dateVal = getRelativeDateString(diff);
      } else if (preset === 'next-week') {
        dateVal = getRelativeDateString(7);
      }

      dueDateInput.value = dateVal;
      datePresetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      clearDateChip.classList.remove('hidden');
    });
  });

  clearDateChip.addEventListener('click', () => {
    dueDateInput.value = '';
    clearDateSelection();
  });

  dueDateInput.addEventListener('change', () => {
    if (dueDateInput.value) {
      clearDateChip.classList.remove('hidden');
    } else {
      clearDateSelection();
    }
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearSearchBtn.classList.toggle('hidden', !searchQuery);
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    render();
  });

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      render();
    });
  });

  // Filter category dropdown
  filterCategorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    render();
  });

  // Sort dropdown
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  // Dashboard batch action buttons
  markAllDoneBtn.addEventListener('click', markAllDone);
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  exportBtn.addEventListener('click', exportTasks);
  importFileInput.addEventListener('change', importTasks);

  // Sample tasks loader
  loadSamplesBtn.addEventListener('click', () => {
    tasks = [...SAMPLE_TASKS];
    saveTasks();
    render();
    showToast('Loaded sample tasks!', 'success');
  });

  // Theme & Sound toggles
  darkModeToggle.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);

  // Edit Modal Events
  editTaskForm.addEventListener('submit', handleEditFormSubmit);
  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // Shortcuts Modal Events
  const openShortcuts = () => shortcutsModal.classList.remove('hidden');
  const closeShortcuts = () => shortcutsModal.classList.add('hidden');

  shortcutsBtn.addEventListener('click', openShortcuts);
  footerShortcutsLink.addEventListener('click', openShortcuts);
  closeShortcutsModalBtn.addEventListener('click', closeShortcuts);
  shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) closeShortcuts();
  });

  // Reset All Data
  footerResetLink.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tasks and clear data?')) {
      tasks = [];
      saveTasks();
      render();
      showToast('All task data has been reset.', 'info');
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      if (!editModal.classList.contains('hidden')) {
        closeEditModal();
      } else if (!shortcutsModal.classList.contains('hidden')) {
        closeShortcuts();
      } else if (searchInput.value) {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        render();
      }
    } else if (!isInputActive) {
      if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        taskInput.focus();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        if (shortcutsModal.classList.contains('hidden')) {
          openShortcuts();
        } else {
          closeShortcuts();
        }
      }
    }
  });

  // Resize canvas handler
  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });
}

// Shake animation helper style injection
(function injectKeyframes() {
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
   BOOT APP
============================================================ */
init();
