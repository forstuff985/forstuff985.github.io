// переменные
const textarea = document.querySelector(".task-text");
const minHeight = textarea.offsetHeight;
const form = document.querySelector(".task-wrapper");
const list = document.querySelector(".task-list");
const doneList = document.querySelector(".done-list");
const clearDoneBtn = document.querySelector(".clear-done-btn");
const clearActiveBtn = document.querySelector(".clear-active-btn");
const PRIORITY_ORDER = {
  high: 1,
  medium: 2,
  low: 3,
};
let selectedPriority = "low";
const select = document.querySelector(".select-priority");
const selected = select.querySelector(".selected");
const options = select.querySelector(".options");
// ============================================================================================================================================
window.addEventListener("DOMContentLoaded", () => {
  const data = localStorage.getItem("tasks");
  if (data) {
    const tasks = JSON.parse(data);
    tasks.forEach((task) => {
      const taskEl = createTaskElement(task.text, task.done, task.priority);
      task.done ? doneList.append(taskEl) : list.append(taskEl);
    });
  }
  sortTasks(list);
  sortTasks(doneList);

  toggleClearButton(clearActiveBtn, list);
  toggleClearButton(clearDoneBtn, doneList);
});

// ============================================================================================================================================
// автоматический размер поля ввода
function autoResizeTextarea(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

textarea.addEventListener("input", function () {
  autoResizeTextarea(this);
});

// ============================================================================================================================================
// добавление задачи
function createTaskElement(text, done = false, priority = "medium") {
  const div = document.createElement("div");
  div.className = "task-item";
  div.dataset.priority = priority;

  if (done) div.classList.add("task-done");

  const checkbox = document.createElement("span");
  checkbox.className = "task-check";
  const flag = document.createElement("img");
  flag.className = "priority";
  if (priority === "high") flag.src = "img/red-flag.png";
  if (priority === "medium") flag.src = "img/yellow-flag.png";
  if (priority === "low") flag.src = "img/blue-flag.png";
  const textSpan = document.createElement("span");
  textSpan.textContent = text;

  div.append(checkbox, flag, textSpan);
  return div;
}

function addTask() {
  const text = textarea.value.trim();
  if (!text || !selectedPriority) return;

  const taskEl = createTaskElement(text, false, selectedPriority);
  list.prepend(taskEl);

  textarea.value = "";
  textarea.style.height = minHeight + "px";
  selected.textContent = "Выберите приоритет задачи";
  selectedPriority = "low ";

  sortTasks(list);
  toggleClearButton(clearActiveBtn, list);
  saveTasks();
  return taskEl;
}

textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addTask();
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  addTask();
});

// ============================================================================================================================================
// редактирование задачи
list.addEventListener("dblclick", (e) => {
  if (!e.target.matches(".task-item span:not(.task-check)")) return;

  const textSpan = e.target;
  const taskItem = textSpan.parentElement;
  const oldText = textSpan.textContent;

  const editArea = document.createElement("textarea");
  editArea.className = "task-edit";
  editArea.value = oldText;

  taskItem.replaceChild(editArea, textSpan);
  editArea.focus();

  autoResizeTextarea(editArea);

  editArea.addEventListener("input", () => {
    autoResizeTextarea(editArea);
  });

  const save = () => {
    const newText = editArea.value.trim() || oldText;
    const newSpan = document.createElement("span");
    newSpan.textContent = newText;
    taskItem.replaceChild(newSpan, editArea);
    saveTasks();
  };

  editArea.addEventListener("blur", save);

  editArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      editArea.blur();
    }
    if (e.key === "Escape") {
      editArea.value = oldText;
      editArea.blur();
    }
  });
});

// ============================================================================================================================================
// добавление задачи в список выполненных
list.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-check")) {
    const taskItem = e.target.closest(".task-item");
    taskItem.classList.add("task-done");
    doneList.prepend(taskItem);
    toggleClearButton(clearDoneBtn, doneList);
    toggleClearButton(clearActiveBtn, list);
    saveTasks();
  }
});

// ============================================================================================================================================
// возврат выполненной задачи в список активных задач
doneList.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-check")) {
    const taskItem = e.target.closest(".task-item");
    taskItem.classList.remove("task-done");
    list.append(taskItem);
    sortTasks(list);
    toggleClearButton(clearActiveBtn, list);
    toggleClearButton(clearDoneBtn, doneList);
    saveTasks();
  }
});

// ============================================================================================================================================
// очистка списка задач
function toggleClearButton(button, list_l) {
  if (list_l.children.length > 0) {
    button.classList.remove("hidden");
  } else {
    button.classList.add("hidden");
  }
}

clearDoneBtn.addEventListener("click", () => {
  doneList.innerHTML = "";
  toggleClearButton(clearDoneBtn, doneList);
  saveTasks();
});

clearActiveBtn.addEventListener("click", () => {
  list.innerHTML = "";
  toggleClearButton(clearActiveBtn, list);
  saveTasks();
});

// ============================================================================================================================================
// сохранение состояния через LocalStorage
function saveTasks() {
  const tasks = [];

  list.querySelectorAll(".task-item").forEach((item) => {
    tasks.push({
      text: item.querySelector("span:not(.task-check)").textContent,
      done: false,
      priority: item.dataset.priority,
    });
  });

  doneList.querySelectorAll(".task-item").forEach((item) => {
    tasks.push({
      text: item.querySelector("span:not(.task-check)").textContent,
      done: true,
      priority: item.dataset.priority,
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ============================================================================================================================================
// смена темы страницы
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const toggleBtn = document.querySelector(".change-theme-btn");
  const icon = document.querySelector(".theme-icon");

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    icon.src = "img/sun.png";
  } else {
    icon.src = "img/moon.png";
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
      icon.src = "img/sun.png";
      localStorage.setItem("theme", "dark");
    } else {
      icon.src = "img/moon.png";
      localStorage.setItem("theme", "light");
    }
  });
});

// ============================================================================================================================================
// открыть / закрыть список приоритетов
options.style.display = "none";
selected.addEventListener("click", () => {
  options.style.display = options.style.display === "block" ? "none" : "block";
});

// ============================================================================================================================================
// выбор приоритета
options.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  selected.innerHTML = li.innerHTML;
  options.style.display = "none";

  if (li.textContent.includes("Высокий")) selectedPriority = "high";
  if (li.textContent.includes("Средний")) selectedPriority = "medium";
  if (li.textContent.includes("Низкий")) selectedPriority = "low";
});

// ============================================================================================================================================
// сортировка по приоритету
function sortTasks(container) {
  const tasks = [...container.children];

  tasks.sort((a, b) => {
    return (
      PRIORITY_ORDER[a.dataset.priority] - PRIORITY_ORDER[b.dataset.priority]
    );
  });

  tasks.forEach((task) => container.append(task));
}