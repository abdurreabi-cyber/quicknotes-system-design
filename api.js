// QuickNotes API client. JSONPlaceholder is a practice API: POST and DELETE
// return simulated responses and do not permanently change its server-side data.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

function showStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = `status ${type}`.trim();
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`The server returned HTTP ${response.status}.`);
  }
  // DELETE responses may have no body.
  if (response.status === 204) return { data: null, status: response.status };
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  return { data, status: response.status };
}

function createNoteElement(note) {
  const item = document.createElement("li");
  item.className = "note";
  item.dataset.noteId = String(note.id);

  const title = document.createElement("h3");
  title.textContent = note.title || "(Untitled note)";
  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";
  const actions = document.createElement("div");
  actions.className = "note-actions";
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

  actions.appendChild(deleteButton);
  item.append(title, body, actions);
  return item;
}

function renderNotes(notes) {
  notesList.replaceChildren();
  if (!notes.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "No notes found. Create your first note above.";
    notesList.appendChild(item);
    return;
  }
  notes.forEach((note) => notesList.appendChild(createNoteElement(note)));
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  try {
    const { data } = await request(`${API_URL}?_limit=10`);
    if (!Array.isArray(data)) throw new Error("The server returned an unexpected response.");
    renderNotes(data);
    showStatus(data.length ? `Loaded ${data.length} notes from the server.` : "No notes found.", "success");
  } catch (error) {
    showStatus(`Could not load notes. ${error.message || "Please try again."}`, "error");
    if (!notesList.children.length) {
      const item = document.createElement("li");
      item.className = "empty";
      item.textContent = "Notes could not be loaded. Check your connection and try again.";
      notesList.replaceChildren(item);
    }
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");
  try {
    const { data, status } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });
    if (!data || typeof data !== "object") throw new Error("The server returned an unexpected response.");
    // JSONPlaceholder simulates POST and usually returns id 101; keep the item
    // in this browser's current list, but do not claim it was permanently saved.
    notesList.querySelector(".empty")?.remove();
    const item = createNoteElement(data);
    notesList.prepend(item);
    showStatus(`Note created (status ${status}, id ${data.id}). Demo only: JSONPlaceholder does not permanently save it.`, "success");
    noteForm.reset();
  } catch (error) {
    showStatus(`Could not create the note. ${error.message || "Please try again."}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...");
  try {
    const { status } = await request(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    const item = notesList.querySelector(`[data-note-id="${CSS.escape(String(id))}"]`);
    if (item) item.remove();
    if (!notesList.children.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No notes found. Create your first note above.";
      notesList.appendChild(empty);
    }
    showStatus(`Note deleted (status ${status}). Demo only: the server does not permanently store changes.`, "success");
  } catch (error) {
    showStatus(`Could not delete the note. ${error.message || "Please try again."}`, "error");
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
