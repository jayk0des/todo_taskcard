const dueDate = new Date(Date.now() + 5 * 60 * 1000);

const dueDateEl = document.getElementById("due-date");
const timeRemainingEl = document.getElementById("time-remaining");
const statusBadgeEl = document.getElementById("status-badge");
const cardEl = document.querySelector('[data-testid="test-todo-card"]');
const titleEl = document.querySelector('[data-testid="test-todo-title"]');
const toggleEl = document.querySelector(
  '[data-testid="test-todo-complete-toggle"]',
);
const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteBtn = document.querySelector(
  '[data-testid="test-todo-delete-button"]',
);

function formatDueDate(date) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return `Due ${date.toLocaleDateString("en-US", options)}`;
}

function pluralize(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function getTimeRemainingText(targetDate) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 60 * 1000) {
    return "Due now!";
  }

  const minutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));

  if (diffMs > 0) {
    if (days >= 2) return `Due in ${pluralize(days, "day")}`;
    if (days === 1) return "Due tomorrow";
    if (hours >= 1) return `Due in ${pluralize(hours, "hour")}`;
    return `Due in ${pluralize(minutes, "minute")}`;
  }

  if (days >= 1) return `Overdue by ${pluralize(days, "day")}`;
  if (hours >= 1) return `Overdue by ${pluralize(hours, "hour")}`;
  return `Overdue by ${pluralize(minutes, "minute")}`;
}

function updateTimeElements() {
  dueDateEl.textContent = formatDueDate(dueDate);
  dueDateEl.setAttribute("datetime", dueDate.toISOString());
  timeRemainingEl.textContent = getTimeRemainingText(dueDate);
  timeRemainingEl.setAttribute("datetime", dueDate.toISOString());
}

function applyCompletionState() {
  const completed = toggleEl.checked;

  cardEl.classList.toggle("completed", completed);
  titleEl.setAttribute(
    "aria-label",
    completed ? "Completed task" : "Pending task",
  );

  if (completed) {
    statusBadgeEl.textContent = "Done";
    statusBadgeEl.classList.remove("pending");
    statusBadgeEl.classList.add("done");
    statusBadgeEl.setAttribute("aria-label", "Status: Done");
  } else {
    statusBadgeEl.textContent = "Pending";
    statusBadgeEl.classList.remove("done");
    statusBadgeEl.classList.add("pending");
    statusBadgeEl.setAttribute("aria-label", "Status: Pending");
  }
}

editBtn.addEventListener("click", () => {
  console.log("edit clicked");
});

deleteBtn.addEventListener("click", () => {
  alert("Delete clicked");
});

toggleEl.addEventListener("change", applyCompletionState);

updateTimeElements();
applyCompletionState();
setInterval(updateTimeElements, 60 * 1000);

