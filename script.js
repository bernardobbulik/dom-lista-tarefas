const descTask = document.getElementById("task-input");
const btnTask = document.getElementById("add-task-btn");
const grid = document.getElementById("task-grid");

let tasks = loadTasks();

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadTasks() {
  const data = window.localStorage.getItem("tasks");
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((task) => ({
        desc: String(task?.desc ?? "").trim(),
        done: Boolean(task?.done),
      }))
      .filter((task) => task.desc.length > 0);
  } catch {
    return [];
  }
}

function saveTasks() {
  window.localStorage.setItem("tasks", JSON.stringify(tasks));
}

function taskCardTemplate(task, index) {
  const doneClass = task.done ? " is-completed" : "";
  const doneLabel = "Concluido";
  const doneDisabled = task.done ? " disabled" : "";

  return `
    <article class="task-card${doneClass}" data-index="${index}">
      <h2 class="task-title">${escapeHTML(task.desc)}</h2>
      <div class="task-actions">
        <button class="task-btn task-btn-complete" data-action="complete"${doneDisabled}>${doneLabel}</button>
        <button class="task-btn task-btn-delete" data-action="delete">Excluir</button>
      </div>
    </article>
  `;
}

function renderTasks() {
  if (tasks.length === 0) {
    grid.innerHTML = `
      <article class="task-card task-card--placeholder">
        <h2>Nenhuma tarefa registrada...</h2>
        <p>Comece digitando uma tarefa!</p>
      </article>
    `;
    return;
  }

  grid.innerHTML = tasks.map(taskCardTemplate).join("");
}

function createTask() {
  const description = descTask.value.trim();
  if (!description) {
    descTask.focus();
    return;
  }

  tasks.push({
    desc: description,
    done: false,
  });

  saveTasks();
  renderTasks();

  descTask.value = "";
  descTask.focus();
}

btnTask.addEventListener("click", createTask);

descTask.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createTask();
  }
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".task-btn");
  if (!button) return;

  const card = button.closest(".task-card");
  if (!card || card.classList.contains("task-card--placeholder")) return;

  const index = Number(card.dataset.index);
  if (Number.isNaN(index) || !tasks[index]) return;

  const action = button.dataset.action;

  if (action === "complete") {
    if (tasks[index].done) return;

    button.disabled = true;
    card.classList.add("is-finishing");

    window.setTimeout(() => {
      tasks[index].done = true;
      saveTasks();
      renderTasks();
    }, 300);
  }

  if (action === "delete") {
    card.classList.add("is-removing");

    window.setTimeout(() => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }, 300);
  }
});

renderTasks();

