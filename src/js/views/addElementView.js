import { getURL } from "../helpers.js";
import View from "./View.js";

class AddElementView extends View {
  _parentElement = document.querySelector(".notes");
  _subheader = document.querySelector(".subheader");
  _btnAdd = document.querySelector(".add-note");
  _overlay = document.querySelector(".overlay");

  _elementWindow;
  _titleInput;
  _textInput;
  _folderColor;

  _btnCreate;
  _btnCancel;
  _btnWithEL;

  constructor() {
    super();
    // Insert add element window to HTML and hide it
    this._insertElementWindow();
    // Select elements and set variables
    this._selectElements();
    // Copy btnCreate to btnWithEL for next replacements
    this._btnWithEL = this._btnCreate;
    // Show add element window
    this._addHandlerAddElement();
  }

  /* --------------------------------------------------- */
  /* ---------------- PRIVATE FUNCTIONS ---------------- */
  /* --------------------------------------------------- */

  // -------------------- SET VARIABLES --------------------
  _selectElements() {
    this._elementWindow = document.querySelector(".element-create");
    this._btnCreate = this._elementWindow.querySelector(".btns-add__create");
    this._btnCancel = this._elementWindow.querySelector(".btns-add__cancel");
    this._titleInput = this._elementWindow.querySelector(
      ".element-create__title"
    );
    this._textInput = this._elementWindow.querySelector(
      ".element-create__text"
    );
    this._btnCancel.addEventListener("click", this._hideNoteWindow.bind(this));
    if (this._btnWithEL) this._btnCreate.replaceWith(this._btnWithEL);
  }

  // -------------------- ELEMENT WINDOW --------------------
  _insertElementWindow() {
    const url = getURL();
    // Remove all element windows from HTML
    document
      .querySelectorAll(".element-create")
      .forEach((element) => element.remove());
    let markup;
    if (url === "notes") markup = this._generateNoteWindow();
    if (url === "folders") markup = this._generateFolderWindow();
    // Render new window
    document.querySelector(".main").insertAdjacentHTML("afterbegin", markup);
    this._selectCircles();
  }

  _addElementWindow() {
    this._insertElementWindow();
    this._selectElements();
    this._elementWindow.classList.add("visible");
    this._btnAdd.classList.add("disabled");
    this._showOverlay();
  }

  _addHandlerAddElement() {
    const that = this;
    this._subheader.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--create");
      if (!btn) return;
      that._btnAdd = btn;
      that._addElementWindow();
    });
  }

  _hideNoteWindow() {
    this._btnAdd.classList.remove("disabled");
    this._elementWindow.classList.remove("visible");
    this._hideOverlay();
    this._validateInputs(this._titleInput);
    this._clearInputs(this._titleInput, this._textInput);
  }

  // -------------------- FOLDER COLORS --------------------
  _selectCircles() {
    // Select all folder circles
    const circles = document.querySelectorAll(".folder-circle");
    // Set folder color to active circle classlist
    circles.forEach((circle) =>
      circle.classList.contains("active")
        ? (this._folderColor = circle.classList[1])
        : ""
    );
    const that = this;
    // Add event listener for each circle
    circles.forEach((circle) =>
      circle.addEventListener("click", function () {
        // Remove active class from all circles
        circles.forEach((circle) => circle.classList.remove("active"));
        // Add active class to clicked circle
        circle.classList.add("active");
        // Set folder color to first class of active circle
        that._folderColor = circle.classList[1];
      })
    );
  }

  /* ------------------------------------------------ */
  /* ---------------- MAIN FUNCTIONS ---------------- */
  /* ------------------------------------------------ */

  // -------------------- CREATE NOTE --------------------
  addHandlerCreateNote(handler) {
    const that = this;
    this._btnCreate.addEventListener("click", function () {
      if (location.hash.slice(1) === "notes") that._createNote(handler);
    });
  }

  _createNote(handler) {
    const title = this._titleInput;
    const text = this._textInput;
    const date = new Date();
    const note = {
      noteTitle: title.value,
      noteText: text.value.trim(),
      noteDate: date,
    };
    this._validateInputs(title, title.value, text.value) ? handler(note) : "";
    this._clearInputs(title, text);
  }

  // -------------------- CREATE FOLDER --------------------
  addHandlerCreateFolder(handler) {
    const that = this;
    this._btnCreate.addEventListener("click", function () {
      if (location.hash.slice(1) === "folders") that._createFolder(handler);
    });
  }

  _createFolder(handler) {
    const title = this._titleInput;
    const text = this._textInput;
    const date = new Date();
    const folder = {
      folderTitle: title.value,
      folderText: text.value.trim(),
      folderDate: date,
      folderColor: this._folderColor,
    };
    this._validateInputs(title, title.value, text.value) ? handler(folder) : "";
    this._clearInputs(title, text);
  }

  /* ---------------------------------------------------------- */
  /* ---------------- RENDER AND GENERATE HTML ---------------- */
  /* ---------------------------------------------------------- */

  // -------------------- ELEMENT WINDOW --------------------
  _generateNoteWindow() {
    return `
      <div class="note-create element-create note-item">
        <input class="note-create__title element-create__title" type="text" placeholder="Enter note title">
        <textarea class="note-create__text element-create__text" placeholder="Text"></textarea>
        <div class="btns-add">
          <a class="btns-add__cancel">Cancel</a>
          <a class="btns-add__create btn--simple">Create</a>
        </div>
      </div>
    `;
  }

  _generateFolderWindow() {
    return `
      <div class="folder-create element-create folder-item visible">
        <input
          class="folder-create__title element-create__title"
          type="text"
          placeholder="Enter folder name"
        />
        <textarea
          class="folder-create__text element-create__text"
          placeholder="Text"
        ></textarea>
      <div class="folder-create__bottom">
          <div class="folder-circles">
            <div class="folder-circle circle--dark active"></div>
            <div class="folder-circle circle--tertiary"></div>
            <div class="folder-circle circle--primary"></div>
            <div class="folder-circle circle--ocean"></div>
            <div class="folder-circle circle--violet"></div>
          </div>
          <div class="btns-add">
            <a class="btns-add__cancel">Cancel</a>
            <a class="btns-add__create btn--simple">Create</a>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------- GENERATE ELEMENT (NOTE/FOLDER) --------------------
  _generateMarkup(element) {
    const formattedDate = this._getFormattedDate(
      element === "note" ? this._data.noteDate : this._data.folderDate
    );
    const window = document.querySelector(".element-create");
    if (window) this._hideNoteWindow();
    this._hideOverlay();
    if (element === "note") {
      return `
      <div class="note-card note-item" data-id="${this._data.noteID}">
        <div class="note-card__title card-title">${this._data.noteTitle}</div>
        <div class="note-card__text card-text">${this._data.noteText}</div>
        <div class="note-card__date card-date">${formattedDate}</div>
        <div class="note-card__edit">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.4365 3.33774L16.5049 7.42608L6.20657 17.7749L2.14042 13.6866L12.4365 3.33774ZM19.5921 2.35173L17.7777 0.52847C17.0765 -0.176157 15.938 -0.176157 15.2344 0.52847L13.4964 2.27497L17.5648 6.36335L19.5921 4.32615C20.136 3.7796 20.136 2.89824 19.5921 2.35173ZM0.0113215 19.433C-0.0627191 19.7679 0.238132 20.0679 0.571391 19.9865L5.105 18.8819L1.03885 14.7936L0.0113215 19.433Z"
                fill="white"
              />
            </svg>
          </div>
      </div> 
  `;
    }
    if (element === "folder") {
      return `
      <div class="folder-card folder-item" data-id="${this._data.folderID}">
        <div class="folder-circle ${
          this._data.folderColor ?? this._folderColor
        }"></div>
        <div class="folder-card__title card-title">${
          this._data.folderTitle
        }</div>
        <div class="folder-card__text card-text">${this._data.folderText}</div>
        <div class="folder-card__info">
          <div class="folder-card__size">${
            this._data.notes?.length ?? 0
          } notes</div>
          <div class="folder-card__date card-date">${formattedDate}</div>
        </div>
      </div>
  `;
    }
  }
}

export default new AddElementView();
