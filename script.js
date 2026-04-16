const STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PRIORITY_CLASS = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

const state = {
  title: "Ship Interactive Todo Card",
  description:
    "Build a clean, accessible and responsive task card with editing support, status transitions, live time management, and keyboard-friendly controls. This description is intentionally long so the card starts collapsed and can be expanded or collapsed with a dedicated toggle button.",
  priority: "High",
  dueDate: new Date(Date.now() + 75 * 60 * 1000),
  status: STATUS.PENDING,
  expanded: false,
  isEditing: false,
};

let timeIntervalId = null;

const refs = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  view: document.getElementById("todo-view"),
  title: document.querySelector('[data-testid="test-todo-title"]'),
  description: document.querySelector('[data-testid="test-todo-description"]'),
  priorityBadge: document.querySelector('[data-testid="test-todo-priority"]'),
  dueDate: document.querySelector('[data-testid="test-todo-due-date"]'),
  timeRemaining: document.querySelector('[data-testid="test-todo-time-remaining"]'),
  statusBadge: document.querySelector('[data-testid="test-todo-status"]'),
  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]'),
  editButton: document.querySelector('[data-testid="test-todo-edit-button"]'),
  deleteButton: document.querySelector('[data-testid="test-todo-delete-button"]'),
  statusControl: document.querySelector('[data-testid="test-todo-status-control"]'),
  overdueIndicator: document.querySelector('[data-testid="test-todo-overdue-indicator"]'),
  expandToggle: document.querySelector('[data-testid="test-todo-expand-toggle"]'),
  collapsible: document.querySelector('[data-testid="test-todo-collapsible-section"]'),
  editForm: document.querySelector('[data-testid="test-todo-edit-form"]'),
  editTitle: document.querySelector('[data-testid="test-todo-edit-title-input"]'),
  editDescription: document.querySelector('[data-testid="test-todo-edit-description-input"]'),
  editPriority: document.querySelector('[data-testid="test-todo-edit-priority-select"]'),
  editDueDate: document.querySelector('[data-testid="test-todo-edit-due-date-input"]'),
  saveButton: document.querySelector('[data-testid="test-todo-save-button"]'),
  cancelButton: document.querySelector('[data-testid="test-todo-cancel-button"]'),
};

function toDateTimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatDueDate(date) {
  return `Due ${date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function pluralize(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function getTimeDetails(targetDate) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 60 * 1000) {
    return { text: "Due now!", isOverdue: false };
  }

  const minutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));

  if (diffMs > 0) {
    if (days >= 1) return { text: `Due in ${pluralize(days, "day")}`, isOverdue: false };
    if (hours >= 1) return { text: `Due in ${pluralize(hours, "hour")}`, isOverdue: false };
    return { text: `Due in ${pluralize(minutes, "minute")}`, isOverdue: false };
  }

  if (days >= 1) return { text: `Overdue by ${pluralize(days, "day")}`, isOverdue: true };
  if (hours >= 1) return { text: `Overdue by ${pluralize(hours, "hour")}`, isOverdue: true };
  return { text: `Overdue by ${pluralize(minutes, "minute")}`, isOverdue: true };
}

function clearTimeUpdater() {
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }
}

function ensureTimeUpdater() {
  if (state.status === STATUS.DONE) {
    clearTimeUpdater();
    return;
  }

  if (!timeIntervalId) {
    timeIntervalId = setInterval(renderTime, 30 * 1000);
  }
}

function renderPriority() {
  Object.values(PRIORITY_CLASS).forEach((cls) => refs.card.classList.remove(cls));
  refs.card.classList.add(PRIORITY_CLASS[state.priority]);
  refs.priorityBadge.textContent = state.priority;
  refs.priorityBadge.setAttribute("aria-label", `Priority: ${state.priority}`);
}

function renderStatus() {
  refs.statusControl.value = state.status;
  refs.checkbox.checked = state.status === STATUS.DONE;
  refs.statusBadge.textContent = state.status;
  refs.statusBadge.classList.remove("pending", "in-progress", "done");
  refs.card.classList.remove("status-pending", "status-in-progress", "status-done");

  if (state.status === STATUS.PENDING) {
    refs.statusBadge.classList.add("pending");
    refs.card.classList.add("status-pending");
  }
  if (state.status === STATUS.IN_PROGRESS) {
    refs.statusBadge.classList.add("in-progress");
    refs.card.classList.add("status-in-progress");
  }
  if (state.status === STATUS.DONE) {
    refs.statusBadge.classList.add("done");
    refs.card.classList.add("status-done");
  }

  refs.statusBadge.setAttribute("aria-label", `Status: ${state.status}`);

  refs.card.classList.toggle("is-done", state.status === STATUS.DONE);
}

function renderDescription() {
  refs.description.textContent = state.description;

  const needsCollapse = state.description.length > 170;
  refs.expandToggle.classList.toggle("hidden", !needsCollapse);

  if (!needsCollapse) {
    refs.collapsible.classList.remove("is-collapsed");
    refs.expandToggle.setAttribute("aria-expanded", "true");
    refs.expandToggle.textContent = "Show less";
    return;
  }

  refs.collapsible.classList.toggle("is-collapsed", !state.expanded);
  refs.expandToggle.setAttribute("aria-expanded", String(state.expanded));
  refs.expandToggle.textContent = state.expanded ? "Show less" : "Show more";
}

function renderTime() {
  refs.dueDate.textContent = formatDueDate(state.dueDate);
  refs.dueDate.setAttribute("datetime", state.dueDate.toISOString());

  if (state.status === STATUS.DONE) {
    refs.timeRemaining.textContent = "Completed";
    refs.timeRemaining.removeAttribute("datetime");
    refs.overdueIndicator.classList.add("hidden");
    refs.card.classList.remove("is-overdue");
    return;
  }

  const details = getTimeDetails(state.dueDate);
  refs.timeRemaining.textContent = details.text;
  refs.timeRemaining.setAttribute("datetime", state.dueDate.toISOString());

  refs.overdueIndicator.classList.toggle("hidden", !details.isOverdue);
  refs.card.classList.toggle("is-overdue", details.isOverdue);
}

function renderMainView() {
  refs.title.textContent = state.title;
  renderPriority();
  renderStatus();
  renderDescription();
  renderTime();

  ensureTimeUpdater();
}

function openEditMode() {
  state.isEditing = true;
  refs.view.classList.add("hidden");
  refs.editForm.classList.remove("hidden");

  refs.editTitle.value = state.title;
  refs.editDescription.value = state.description;
  refs.editPriority.value = state.priority;
  refs.editDueDate.value = toDateTimeLocalValue(state.dueDate);

  refs.editTitle.focus();
}

function closeEditMode() {
  state.isEditing = false;
  refs.editForm.classList.add("hidden");
  refs.view.classList.remove("hidden");
  refs.editButton.focus();
}

function applyStatusChange(nextStatus) {
  state.status = nextStatus;
  renderStatus();
  renderTime();
  ensureTimeUpdater();
}

refs.checkbox.addEventListener("change", () => {
  if (refs.checkbox.checked) {
    applyStatusChange(STATUS.DONE);
    return;
  }

  if (state.status === STATUS.DONE) {
    applyStatusChange(STATUS.PENDING);
  }
});

refs.statusControl.addEventListener("change", (event) => {
  const nextStatus = event.target.value;
  applyStatusChange(nextStatus);
});

refs.expandToggle.addEventListener("click", () => {
  state.expanded = !state.expanded;
  renderDescription();
});

refs.editButton.addEventListener("click", () => {
  openEditMode();
});

refs.deleteButton.addEventListener("click", () => {
  alert("Delete clicked");
});

refs.editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  state.title = refs.editTitle.value.trim() || state.title;
  state.description = refs.editDescription.value.trim() || state.description;
  state.priority = refs.editPriority.value;

  const nextDueDate = new Date(refs.editDueDate.value);
  if (!Number.isNaN(nextDueDate.getTime())) {
    state.dueDate = nextDueDate;
  }

  state.expanded = false;
  renderMainView();
  closeEditMode();
});

refs.cancelButton.addEventListener("click", () => {
  closeEditMode();
});

renderMainView();
