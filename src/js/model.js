import { getURL, setDefaultURL } from "./helpers.js";

export const state = {
  notes: [],
  currentNote: {},
  folders: [],
  sorting: "default",
  search: {
    searching: false,
    results: [],
  },
  pagination: {
    notes: [],
    folders: [],
    page: 1,
    resultsPerPage: 9,
    type: "",
  },
};

/* ----------------------------------------------- */
/* ---------------- LOCAL STORAGE ---------------- */
/* ----------------------------------------------- */

const setNotesLS = function () {
  localStorage.setItem("notes", JSON.stringify(state.notes));
};

const setFoldersLS = function () {
  localStorage.setItem("folders", JSON.stringify(state.folders));
};

/* --------------------------------------- */
/* ---------------- NOTES ---------------- */
/* --------------------------------------- */

export const createNote = function (newNote, getNote = false) {
  // Creating and pushing note to state.notes
  const note = {
    noteTitle: newNote.noteTitle,
    noteText: newNote.noteText,
    noteDate: newNote.noteDate,
    noteID: state.notes.length ? state.notes.at(-1).noteID + 1 : 1,
  };
  state.notes.push(note);

  // Return note if creating from folder
  if (getNote) return note;

  // Pushing note to state.pagination due to the sorting value and setting page
  if (state.sorting === "default") {
    state.pagination.notes.push(note);
    state.pagination.page = Math.ceil(
      state.pagination.notes.length / state.pagination.resultsPerPage
    );
  }
  if (state.sorting === "recent") {
    state.pagination.notes.unshift(note);
    state.pagination.page = 1;
  }
  if (state.sorting === "alphabet") {
    state.pagination.notes = [...state.notes].sort(function (a, note) {
      if (a.noteTitle < note.noteTitle) return -1;
      if (a.noteTitle > note.noteTitle) return 1;
    });
    state.pagination.page = Math.ceil(
      state.pagination.notes.indexOf(note) / state.pagination.resultsPerPage
    );
  }

  // Update local storage and return note
  setNotesLS();
  return note;
};

export const addNoteToFolder = function (noteID, folderID) {
  // Selecting folder and note by id
  const folder = state.folders.find((folder) => folder.folderID === folderID);
  const note = state.notes.find((note) => note.noteID === noteID);

  // if number of notes in folder < 9 then add it else render message
  if (folder.notes.length < 9) {
    folder.notes.unshift(note);
    note.folderID = folder.folderID;
    setNotesLS();
    setFoldersLS();
  } else {
    alert("SORRY");
  }
};

export const deleteNote = function (noteID) {
  const note = state.notes.filter((note) => note.noteID !== noteID);
  state.notes = note;
  const folderNote = state.folders.filter((folder) =>
    folder.notes.find((note) => note.noteID === noteID)
  );
  folderNote.forEach(
    (folder) =>
      (folder.notes = folder.notes.filter((note) => note.noteID !== noteID))
  );
  setNotesLS();
  setFoldersLS();
  sortElements();
};

/* ----------------------------------------- */
/* ---------------- FOLDERS ---------------- */
/* ----------------------------------------- */

export const createFolder = function (newFolder) {
  // Creating and pushing folder to state.folders
  const folder = {
    notes: [],
    folderTitle: newFolder.folderTitle,
    folderText: newFolder.folderText,
    folderDate: newFolder.folderDate,
    folderID: state.folders.length ? state.folders.at(-1).folderID + 1 : 1,
    folderColor: newFolder.folderColor,
  };
  state.folders.push(folder);

  // Pushing folder to state.pagination due to the sorting value and setting page
  if (state.sorting === "default") {
    state.pagination.folders.push(folder);
    state.pagination.page = Math.ceil(
      state.pagination.folders.length / state.pagination.resultsPerPage
    );
  }
  if (state.sorting === "recent") {
    state.pagination.folders.unshift(folder);
    state.pagination.page = 1;
  }
  if (state.sorting === "alphabet") {
    state.pagination.folders = [...state.folders].sort(function (a, folder) {
      if (a.folderTitle < folder.folderTitle) return -1;
      if (a.folderTitle > folder.folderTitle) return 1;
    });
    state.pagination.page = Math.ceil(
      state.pagination.folders.indexOf(folder) / state.pagination.resultsPerPage
    );
  }

  // Update local storage and return folder
  setFoldersLS();
  return folder;
};

export const createFolderNote = function (newNote, folderID) {
  // Create new note, select current folder, add note to folder, and return it
  const note = createNote(newNote, true);
  setNotesLS();
  const folder = state.folders.find((folder) => folder.folderID === folderID);
  addNoteToFolder(note.noteID, folderID);
  return folder;
};

export const findFolderNote = function (noteID, folderID) {
  // Find note inside folder, set folderID of note, and return it
  const note = state.folders
    .find((folder) => folder.folderID === folderID)
    .notes.find((note) => note.noteID === noteID);
  note.folderID = folderID;
  return note;
};

const updateNoteIDs = function (folderID) {
  const notes = state.notes.filter((note) => note.folderID === folderID);
  notes.forEach((note) => delete note.folderID);
};

export const deleteFolder = function (folderID) {
  const newFolders = state.folders.filter((note) => note.folderID !== folderID);
  state.folders = newFolders;
  updateNoteIDs(folderID);
  setNotesLS();
  setFoldersLS();
  sortElements();
};

export const removeNote = function (folderID, noteID) {
  const folder = state.folders.findIndex(
    (folder) => folder.folderID === folderID
  );
  const newNotes = state.folders
    .find((folder) => folder.folderID === folderID)
    .notes.filter((note) => note.noteID !== noteID);
  updateNoteIDs(folderID);
  state.folders[folder].notes = newNotes;
  setFoldersLS();
};
/* --------------------------------------------------------- */
/* ---------------- FIND ITEM / UPDATE ITEM ---------------- */
/* --------------------------------------------------------- */

export const findItem = function (item, id) {
  if (item === "note") {
    return state.notes.find((note) => note.noteID === id);
  }
  if (item === "folder") {
    return state.folders.find((folder) => folder.folderID === id);
  }
};

const changeNote = function (note, updatedNote) {
  // Change text of note
  note.noteTitle = updatedNote.noteTitle;
  note.noteText = updatedNote.noteText;
  note.noteDate = new Date();
};

const changeFolder = function (folder, updatedFolder) {
  // Change text of folder
  folder.folderTitle = updatedFolder.folderTitle;
  folder.folderText = updatedFolder.folderText;
  folder.folderDate = new Date();
};

export const updateItem = function (item, updatedItem) {
  let element;

  // Select note in folder
  if (updatedItem.noteID && updatedItem.folderID) {
    element = state.folders
      .find((folder) => folder.folderID === updatedItem.folderID)
      .notes.find((note) => note.noteID === updatedItem.noteID);
    changeNote(element, updatedItem);
  }

  // Select note
  if (item === "note") {
    element = state.notes.find(
      (stateNote) => stateNote.noteID === updatedItem.noteID
    );
  }

  // Update note
  if (item === "note" || item === "folder-note") {
    changeNote(element, updatedItem);
  }

  // Select and update folder
  if (item === "folder") {
    element = state.folders.find(
      (stateFolder) => stateFolder.folderID === updatedItem.folderID
    );
    changeFolder(element, updatedItem);
  }

  // Update local storage and return element
  setNotesLS();
  setFoldersLS();
  return element;
};

/* -------------------------------------------- */
/* ---------------- PAGINATION ---------------- */
/* -------------------------------------------- */

export const getPaginationResults = function (
  page = state.pagination.page,
  search
) {
  state.pagination.page = page;

  // Get first and last element of the page
  const start = (page - 1) * state.pagination.resultsPerPage;
  const end = page * state.pagination.resultsPerPage;

  // Get url and set pagination.type
  const url = getURL();
  state.pagination.type = url;

  // Return search results
  if (search) return state.search.results.slice(start, end);

  // Return note results
  if (url === "notes") {
    return state.pagination.notes.slice(start, end);
  }

  // Return folder results
  if (url === "folders") {
    return state.pagination.folders.slice(start, end);
  }
};

/* ----------------------------------------- */
/* ---------------- SORTING ---------------- */
/* ----------------------------------------- */

const sortByDefault = function (url, elements) {
  state.pagination[url] = [...elements];
};

const sortByRecent = function (url, elements) {
  // state.pagination[url] = [...elements].reverse();
  // Get date for current elements (noteDate or folderDate)
  const date = `${url.slice(0, -1) + "Date"}`;
  // Sort by date (recent)
  state.pagination[url] = [...elements].sort(function (a, b) {
    return new Date(b[date]) - new Date(a[date]);
  });
};

const sortByAlphabet = function (url, elements) {
  const title = url === "notes" ? "noteTitle" : "folderTitle";
  state.pagination[url] = [...elements].sort(function (a, b) {
    if (a[title] < b[title]) return -1;
    if (a[title] > b[title]) return 1;
  });
};

export const sortElements = function (sortBy = state.sorting) {
  // Setting sort to local storage and state
  localStorage.setItem("sorting", sortBy);
  state.sorting = sortBy;

  const url = getURL();
  let elements;

  // Setting variables
  if (!state.search.searching) {
    state.pagination.notes = [...state.notes];
    state.pagination.folders = [...state.folders];
    elements = url === "notes" ? state.notes : state.folders;
  } else elements = state.search.results;

  // Sorting elements
  if (state.sorting === "default") sortByDefault(url, elements);
  if (state.sorting === "recent") sortByRecent(url, elements);
  if (state.sorting === "alphabet") sortByAlphabet(url, elements);
};

/* ---------------------------------------- */
/* ---------------- SEARCH ---------------- */
/* ---------------------------------------- */

export const searchItems = function (query) {
  // Setting search
  if (query !== "") state.search.searching = true;
  if (query === "") return (state.search.searching = false);

  const url = getURL();
  const items = url === "notes" ? state.notes : state.folders;
  let filteredItems;

  // Searching notes or folders
  if (url === "notes") {
    filteredItems = [...items].filter((item) => item.noteTitle.includes(query));
  }
  if (url === "folders") {
    filteredItems = [...items].filter((item) =>
      item.folderTitle.includes(query)
    );
  }

  // Setting search results to state
  state.search.results = filteredItems;
  state.pagination[url] = filteredItems;
  console.log(filteredItems);
  if (!filteredItems.length) return false;
  return true;
};

export const searchFolders = function (query) {
  return [...state.folders].filter((folder) =>
    folder.folderTitle.toLowerCase().includes(query)
  );
};

/* --------------------------------------- */
/* ---------------- LOGIN ---------------- */
/* --------------------------------------- */

export const createAccount = function (account) {
  localStorage.setItem("account", JSON.stringify(account));
  checkAuth();
};

export const checkAuth = function () {
  const account = localStorage.getItem("account");
  if (account) {
    init();
    return JSON.parse(account);
  }
  if (!account) return false;
};

/* ------------------------------------------------ */
/* ---------------- INITIALIZATION ---------------- */
/* ------------------------------------------------ */

const init = function () {
  // Getting data from local storage
  const notes = localStorage.getItem("notes");
  const folders = localStorage.getItem("folders");
  const sorting = localStorage.getItem("sorting");

  if (!notes && !sorting && !folders) return;

  // Setting state data
  state.notes = JSON.parse(notes) ?? [];
  state.folders = JSON.parse(folders) ?? [];
  state.sorting = sorting;

  // Setting default url of page
  setDefaultURL();

  // Sort elements by sorting value from local storage
  if (state.notes || state.folders) sortElements(sorting);
};

setDefaultURL();
