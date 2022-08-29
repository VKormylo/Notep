import * as model from "./model.js";
import navbarView from "./views/navbarView.js";
import addElementView from "./views/addElementView.js";
import notesView from "./views/notesView.js";
import foldersView from "./views/foldersView.js";
import noteView from "./views/noteView.js";
import folderView from "./views/folderView.js";
import paginationView from "./views/paginationView.js";
import sortingView from "./views/sortingView.js";
import searchView from "./views/searchView.js";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { getURL } from "./helpers.js";
import authView from "./views/authView.js";

if (module.hot) {
  module.hot.accept();
}

/* --------------------------------------------------------- */
/* ---------------- CONTROL AUTHENTICATION ----------------- */
/* --------------------------------------------------------- */

const login = function (username) {
  init();
  authView.login(username);
};

const controlAuth = function (account) {
  model.createAccount(account);
  login(account.username);
};

/* ----------------------------------------------- */
/* ---------------- CONTROL NOTES ---------------- */
/* ----------------------------------------------- */

const controlNotes = function (id) {
  const currentNote = model.findItem("note", id);
  noteView.render(currentNote);
};

const controlAddNotes = function (newNote) {
  const note = model.createNote(newNote);
  addElementView.render(note, true, "note");
  notesView.render(model.getPaginationResults());
  paginationView.render(model.state.pagination);
};

const controlNoteSearchFolders = function (query) {
  const folderResults = model.searchFolders(query);
  if (!folderResults.length) noteView.renderMessage();
  noteView.renderFolderResults(folderResults);
};

const controlNoteAddToFolder = function (noteID, folderID) {
  model.addNoteToFolder(noteID, folderID);
};

const controlDeleteNote = function (noteID, folderID) {
  model.deleteNote(noteID);
  if (!folderID) controlPagination();
  if (folderID) controlFolders(folderID);
};

/* ------------------------------------------------- */
/* ---------------- CONTROL FOLDERS ---------------- */
/* ------------------------------------------------- */

const controlFolders = function (id) {
  const currentFolder = model.findItem("folder", id);
  folderView.render(currentFolder);
  folderView.renderFolderNotes(currentFolder.notes);
};

const controlAddFolders = function (newFolder) {
  const folder = model.createFolder(newFolder);
  addElementView.render(folder, true, "folder");
  foldersView.render(model.getPaginationResults());
  paginationView.render(model.state.pagination);
};

const controlFolderNotes = function (noteID, back, folderID) {
  const currentNote = model.findFolderNote(noteID, folderID);
  noteView.render(currentNote, true, back);
};

const controlAddFolderNote = function (newNote, folderID) {
  const currentFolder = model.createFolderNote(newNote, folderID);
  folderView.renderFolderNotes(currentFolder.notes);
};

const controlDeleteFolder = function (folderID) {
  model.deleteFolder(folderID);
  controlPagination();
};

const controlRemoveNote = function (folderID, noteID) {
  model.removeNote(folderID, noteID);
  controlFolders(folderID);
};

/* ------------------------------------------------ */
/* ---------------- CONTROL CHANGE ---------------- */
/* ------------------------------------------------ */

const controlItemChange = function (item, updatedItem) {
  const element = model.updateItem(item, updatedItem);
  if (item === "note") noteView.render(element);
  if (item === "folder") controlFolders(element.folderID);
  if (item === "folder-note") {
    const folder = model.findItem("folder", updatedItem.folderID);
    controlFolderNotes(element.noteID, folder.folderTitle, element.folderID);
  }
};

/* ---------------------------------------------------- */
/* ---------------- CONTROL PAGINATION ---------------- */
/* ---------------------------------------------------- */

const controlPagination = function (goToPage) {
  const url = getURL();
  model.sortElements();
  if (url === "notes") {
    notesView.render(model.getPaginationResults(goToPage));
  }
  if (url === "folders")
    foldersView.render(model.getPaginationResults(goToPage));
  paginationView.render(model.state.pagination);
};

/* ------------------------------------------------- */
/* ---------------- CONTROL SORTING ---------------- */
/* ------------------------------------------------- */

const controlSorting = function (sortBy) {
  const url = getURL();
  model.sortElements(sortBy);
  if (url === "notes") notesView.render(model.getPaginationResults());
  if (url === "folders") foldersView.render(model.getPaginationResults());
};

/* ------------------------------------------------ */
/* ---------------- CONTROL SEARCH ---------------- */
/* ------------------------------------------------ */

const controlSearch = function (query = "") {
  const url = getURL();
  // Get search results (true or false)
  const results = model.searchItems(query);
  // Sort elements
  model.sortElements(undefined);
  // If there are no results then render message, else render results
  if (url === "notes") {
    if (!results && query)
      return notesView.renderMessage(undefined, "main-message", true);
    notesView.render(model.getPaginationResults(1));
  }
  if (url === "folders") {
    if (!results && query)
      return foldersView.renderMessage(
        `Oops, no folders found!`,
        "main-message"
      );
    foldersView.render(model.getPaginationResults(1));
  }
  // Render pagination
  paginationView.render(model.state.pagination);
};

/* ------------------------------------------------ */
/* ---------------- CONTROL NAVBAR ---------------- */
/* ------------------------------------------------ */

const controlNavbar = function () {
  controlPagination(1);
  controlSorting();
};

/* -------------------------------------------------------------------- */
/* ---------------- INITIALIZATION AND ADDING HANDLERS ---------------- */
/* -------------------------------------------------------------------- */

const init = function () {
  // -------------------- ADD ELEMENT VIEW --------------------
  addElementView.addHandlerCreateNote(controlAddNotes);
  addElementView.addHandlerCreateFolder(controlAddFolders);

  // -------------------- NOTE VIEW --------------------
  noteView.addHandlerSelectNote(controlNotes);
  noteView.addHandlerSelectFolderNote(controlFolderNotes);
  noteView.addHandlerOnChange();
  noteView.addHandlerChangeNote(controlItemChange);
  noteView.addHandlerAddToFolder(controlNoteAddToFolder);
  noteView.addHandlerSearchFolders(controlNoteSearchFolders);
  noteView.addHandlerGoBack(controlPagination);
  noteView.addHandlerDeleteNote(controlDeleteNote);

  // -------------------- FOLDER VIEW --------------------
  folderView.addHandlerSelectFolder(controlFolders);
  folderView.addHandlerOnChange();
  folderView.addHandlerChangeFolder(controlItemChange);
  folderView.addHandlerAddFolderNote();
  folderView.addHandlerCreateFolderNote(controlAddFolderNote);
  folderView.addHandlerGoBack(controlPagination);
  folderView.addHandlerGoBackToFolder(controlFolders);
  folderView.addHandlerDeleteFolder(controlDeleteFolder);
  folderView.addHandlerRemoveNote(controlRemoveNote);

  // -------------------- PAGINATION VIEW --------------------
  paginationView.addHandlerClick(controlPagination);

  // -------------------- SORTING VIEW --------------------
  sortingView.setSelected(model.state.sorting);
  sortingView.addHandlerSelect(controlSorting);

  // -------------------- SEARCH VIEW --------------------
  searchView.addHandlerSearch(controlSearch);
  searchView.addHandlerClearSearch(controlSearch);

  // -------------------- NAVBAR VIEW --------------------
  navbarView.setUrl(controlNavbar);
  navbarView.addHandlerChangeUrl(controlNavbar);
};

const loggedIn = function () {
  // -------------------- AUTH VIEW --------------------
  authView.addHandlerCreateAccount(controlAuth);
  const logged = model.checkAuth();
  console.log(logged);
  if (!logged) authView.showSignUpWindow();
  if (logged) login(logged.username);
};

loggedIn();
