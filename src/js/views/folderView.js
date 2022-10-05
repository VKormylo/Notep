import EditView from "./editView.js";

class FolderView extends EditView {
  // Main
  _parentElement = document.querySelector(".folders");
  _container = document.querySelector(".container");
  _pagination = document.querySelector(".pagination");
  // Edit
  _originalObject;
  _editedObject;
  // Add note
  _addWindowBtn;
  _folderNoteWindow;
  _removeBtn;
  // Folder info
  _originalTitle;
  _originalText;

  constructor() {
    super(document.querySelector(".folders"));
    // Update subheader on url change
    this._onPageChange();
    // Hide add note window
    this._addHandlerHideFolderNote();
    // Toggle edit window
    this._addHandlerToggleEdit();
  }

  /* --------------------------------------------------- */
  /* ---------------- PRIVATE FUNCTIONS ---------------- */
  /* --------------------------------------------------- */

  _addHandlerHideFolderNote() {
    // Hide creating folder window
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btns-add__cancel");
      if (!btn) return;
      that._addWindowBtn.classList.remove("disabled");
      const folderNote = document.querySelector(".folder-note");
      folderNote.remove();
    });
  }

  /* ------------------------------------------------ */
  /* ---------------- MAIN FUNCTIONS ---------------- */
  /* ------------------------------------------------ */

  // -------------------- FOLDER NOTES --------------------
  addHandlerAddFolderNote() {
    // Show creating folder window (add to HTML)
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".folder-add__note");
      if (!btn) return;
      // Disable button
      that._addWindowBtn = btn;
      that._addWindowBtn.classList.add("disabled");
      const folderNotes = document.querySelector(".folder-notes");
      // Render folder note
      const markup = that._generateAddNoteWindow();
      folderNotes.insertAdjacentHTML("afterbegin", markup);
      that._folderNoteWindow = document.querySelector(".folder-note");
    });
  }

  addHandlerCreateFolderNote(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btns-add__create");
      if (!btn) return;
      // Get title and text
      const title = that._folderNoteWindow.querySelector(
        ".element-create__title"
      );
      const text = that._folderNoteWindow.querySelector(
        ".element-create__text"
      );
      const folderID = +document.querySelector(".folder").dataset.id;
      // Create note object
      const date = new Date();
      const note = {
        noteTitle: title.value,
        noteText: text.value.trim(),
        noteDate: date,
      };
      // If inputs are valid, then create new note
      that._validateInputs(title, title.value, text.value)
        ? handler(note, folderID)
        : "";
      that._clearInputs(title, text);
      // Hide add note window
      that._addWindowBtn.classList.remove("disabled");
    });
  }

  // -------------------- SELECT AND CHANGE --------------------
  addHandlerSelectFolder(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const folder = e.target.closest(".folder-card");
      if (!folder) return;
      that._onElementSelect("folder");
      // Save original title and text of the folder
      that._setOriginalInfo(folder, "folder");
      const id = +folder.dataset.id;
      handler(id);
    });
  }

  addHandlerChangeFolder(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const changeBtn = e.target.closest(".folder-change");
      if (!changeBtn) return;
      const folder = document.querySelector(".folder");
      // Save original title and text of the folder, get title and text
      const [title, text] = that._setOriginalInfo(folder, "folder", true, true);
      const id = +folder.dataset.id;
      const currentFolder = {
        folderTitle: title,
        folderText: text,
        folderID: id,
      };
      handler("folder", currentFolder);
    });
  }

  // -------------------- GO BACK --------------------
  addHandlerGoBack(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const link = e.target.closest(".btn-back");
      if (!link) return;
      that._onElementSelect("folder", false);
      handler();
    });
  }

  addHandlerGoBackToFolder(handler) {
    const that = this;
    const notes = document.querySelector(".notes");
    notes.addEventListener("click", function (e) {
      const link = e.target.closest(".btn-back");
      const note = document.querySelector(".note");
      // Check if going back only from selected note page
      if (!link || !note) return;
      const folderID = +note.dataset.folder;
      notes.replaceWith(that._parentElement);
      handler(folderID);
    });
  }

  replaceNotesWithFolders() {
    const notes = document.querySelector(".notes");
    notes.replaceWith(this._parentElement);
  }

  // -------------------- REMOVE NOTE --------------------
  addHandlerRemoveNote(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".note-remove__btn");
      if (!btn) return;
      const folderID = +document.querySelector(".folder").dataset.id;
      const noteID = +btn.closest(".folder-note").dataset.id;
      handler(folderID, noteID);
    });
  }

  // -------------------- DELETE FOLDER --------------------
  addHandlerDeleteFolder(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      // Trigger delete window
      const btn = e.target.closest(".folder-delete__btn");
      if (!btn) return;
      that.renderDeleteWindow(handler);
    });
  }

  _addHandlerDelete(btn, handler) {
    const that = this;
    // Add event listener to confirm deletion button
    btn.addEventListener("click", function () {
      // Get IDs
      const folderID = +document.querySelector(".folder").dataset.id;
      handler(folderID);
      that._onElementSelect("folder", false);
      // Remove delete window and hide overlay
      that._removeDeleteWindow();
    });
  }

  // -------------------- EDIT --------------------
  _editElementStyle(type, value) {
    let element;
    // Set element to the title or text (editing)
    if (this._editElement === "title")
      element = document.querySelector(".folder-title");
    if (this._editElement === "text")
      element = document.querySelector(".folder-text");
    // Change element styles (color, size or fontFamily)
    if (type === "color") element.style.color = value;
    if (type === "size") element.style.fontSize = value;
    if (type === "family") element.style.fontFamily = value;
  }

  _refreshElement() {
    // Set element to the title or text of the folder
    const element = document.querySelector(`.folder-${this._editElement}`);
    // Get variables from original folder object
    const { color, fontSize, fontFamily } =
      this._originalObject[this._editElement];
    // Set element styles to previous styles (cancel changes)
    element.style.color = color;
    element.style.fontSize = fontSize;
    element.style.fontFamily = fontFamily;
    // Rewrite edited folder object (cancel changes)
    this._editedObject = JSON.parse(JSON.stringify(this._originalObject));
    // Cancel disabling
    this._disableButtons(false);
  }

  _addHandlerToggleEdit() {
    const that = this;
    // Add handler to edit title or text btn
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".folder-edit__btn");
      if (!btn) return;
      // Set editElement to "title" or "text" (for later using)
      that._editElement = btn.dataset.element;
      // Get editWindow element
      that._editWindow = that._parentElement.querySelector(".edit-window");
      // Disable other button (if editing title -> disable text btn)
      that._disableButtons();
      // Close window and cancel changes (already visible, click again)
      if (that._editWindow.classList.contains("visible"))
        that._refreshElement();
      // Toggle editWindow
      that._editWindow.classList.toggle("visible");
      // Render default type (color)
      that._renderEditType("color");
      const colorType = Array.from(
        document.querySelectorAll(".edit-type")
      ).find((type) => type.dataset.type === "color");
      // Remove all active classes from other types, add it to color
      that._rewriteActiveClass("edit-type", colorType);
    });
  }

  addHandlerSubmitEdit(handler) {
    const that = this;
    // Add handler to submit edit button
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-submit__btn");
      if (!btn) return;
      const folderID = +document.querySelector(".folder").dataset.id;
      // Close edit window and activate buttons
      that._editWindow.classList.remove("visible");
      that._disableButtons(false);
      // Rewrite original folder object to the new one
      that._originalObject = JSON.parse(JSON.stringify(that._editedObject));
      // Send changed folder object to controller and save it
      handler(folderID, that._editedObject);
    });
  }

  /* ---------------------------------------------------------- */
  /* ---------------- RENDER AND GENERATE HTML ---------------- */
  /* ---------------------------------------------------------- */

  // -------------------- ADD NOTE WINDOW --------------------
  _generateAddNoteWindow() {
    return `
      <div class="folder-note folder-create">
        <input
          class="element-create__title"
          type="text"
          placeholder="Enter note title"
        />
        <textarea
          class="element-create__text"
          type="text"
          placeholder="Text"
        ></textarea>
        <div class="btns-add">
          <a class="btns-add__cancel">Cancel</a>
          <a class="btns-add__create btn--simple">Create</a>
        </div>
      </div>
    `;
  }

  // -------------------- DELETE WINDOW --------------------
  _generateDeleteWindow() {
    return `
      <div class="deleting-window">
          <div class="deleting-name">Deleting folder</div>
          <div class="deleting-title">You want to delete the folder, are you sure?</div>
          <div class="deleting-subtitle">All data of the folder will be deleted, you can still see added notes in all notes page.</div>
          <div class="deleting-btns">
            <a class="deleting-cancel">No</a>
            <a class="deleting-confirm btn--delete">Yes</a>
          </div>
        </div>
    `;
  }

  // -------------------- FOLDER NOTES --------------------
  renderFolderNotes(notes) {
    const folderNotes = document.querySelector(".folder-notes");
    folderNotes.innerHTML = "";
    // Render all notes from data
    const noteElements = notes
      .map((note) => this._generateFolderNotes(note))
      .join("");
    folderNotes.insertAdjacentHTML("afterbegin", noteElements);
  }

  _generateFolderNotes(note) {
    // Format date
    const formattedDate = this._getFormattedDate(note.noteDate);
    return `
    <div class="folder-note note-card" data-id="${note.noteID}">
        <div class="note-card__title card-title">${note.noteTitle}</div>
        <div class="note-card__text card-text">${note.noteText}</div>
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
        <a class="note-remove__btn">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="28" height="28" rx="5" stroke="#364FC7" stroke-width="2"/>
            <rect width="16" height="3" rx="1.5" transform="matrix(1 0 0 -1 7.19995 16.7998)" fill="#364FC7"/>
          </svg>       
        </a>
    </div>
    `;
  }

  // -------------------- FOLDER --------------------
  _generateMarkup() {
    // Format date
    const formattedDate = this._getFormattedDate(this._data.folderDate);
    // Set original folder object and edited object to a DEEP copy from state
    this._originalObject = JSON.parse(JSON.stringify(this._data.folderStyle));
    this._editedObject = JSON.parse(JSON.stringify(this._data.folderStyle));
    // Get title and text style objects for easier use
    const { title: titleStyle, text: textStyle } = this._data.folderStyle;
    this._clear();
    return `
      <div class="folder" data-id="${this._data.folderID}">
      <div class="folder-top element-page__top">
        <div class="btn-back">
          <svg
            width="10"
            height="17"
            viewBox="0 0 10 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.17739 2.56229C9.63467 2.09476 9.63481 1.3476 9.1777 0.879905C8.70587 0.397151 7.92931 0.396915 7.45719 0.879383L1.3688 7.1012C0.608082 7.87859 0.608082 9.12141 1.3688 9.8988L7.45719 16.1206C7.92931 16.6031 8.70587 16.6028 9.1777 16.1201C9.63481 15.6524 9.63467 14.9052 9.17739 14.4377L4.73761 9.89846C3.97733 9.12115 3.97733 7.87885 4.73761 7.10154L9.17739 2.56229Z"
              fill="#536DFE"
            />
          </svg>
          <a class="link-back">All folders</a>
        </div>
        <div class="folder-change current-element__change btn--simple btn--reverse">Change</div>
        <div class="folder-date element-date">${formattedDate}</div>
        <div class="folder-notes__count">
           ${this._data.notes.length} notes
        </div>
        <div class="element-edit__btns">
          <a class="element-edit__title element-edit__btn folder-edit__btn" data-element="title">
            <div class="element-edit__img">
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
            <span>Title</span>
          </a>
          <a class="element-edit__text element-edit__btn folder-edit__btn" data-element="text">
            <div class="element-edit__img">
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
            <span>Text</span>
          </a>
        </div>
        <a class="folder-add__note btn--square ${
          this._data.notes.length >= 9 ? "disabled" : ""
        }">
          <svg
            width="17"
            height="19"
            viewBox="0 0 17 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.7249 0.95V0.475C13.7249 0.349022 13.6749 0.228204 13.5858 0.139124C13.4967 0.0500445 13.3759 2.83122e-08 13.2499 2.83122e-08C13.1239 2.83122e-08 13.0031 0.0500445 12.914 0.139124C12.8249 0.228204 12.7749 0.349022 12.7749 0.475V0.95H11.3499V0.475C11.3499 0.349022 11.2999 0.228204 11.2108 0.139124C11.1217 0.0500445 11.0009 0 10.8749 0C10.7489 0 10.6281 0.0500445 10.539 0.139124C10.4499 0.228204 10.3999 0.349022 10.3999 0.475V0.95H8.9749V0.475C8.9749 0.349022 8.92486 0.228204 8.83578 0.139124C8.7467 0.0500445 8.62588 0 8.4999 0C8.37392 0 8.25311 0.0500445 8.16403 0.139124C8.07495 0.228204 8.0249 0.349022 8.0249 0.475V0.95H6.5999V0.475C6.5999 0.349022 6.54986 0.228204 6.46078 0.139124C6.3717 0.0500445 6.25088 2.00198e-08 6.1249 2.00198e-08C5.99892 2.00198e-08 5.87811 0.0500445 5.78903 0.139124C5.69995 0.228204 5.6499 0.349022 5.6499 0.475V0.95H4.2249V0.475C4.2249 0.349022 4.17486 0.228204 4.08578 0.139124C3.9967 0.0500445 3.87588 2.00198e-08 3.7499 2.00198e-08C3.62392 2.00198e-08 3.50311 0.0500445 3.41403 0.139124C3.32495 0.228204 3.2749 0.349022 3.2749 0.475V0.95C2.64501 0.95 2.04092 1.20022 1.59552 1.64562C1.15012 2.09102 0.899902 2.69511 0.899902 3.325V16.625C0.899902 17.2549 1.15012 17.859 1.59552 18.3044C2.04092 18.7498 2.64501 19 3.2749 19H10.4051L16.0999 13.3V3.325C16.0999 2.69511 15.8497 2.09102 15.4043 1.64562C14.9589 1.20022 14.3548 0.95 13.7249 0.95ZM5.1749 5.7H11.8108C11.9368 5.7 12.0576 5.75004 12.1467 5.83912C12.2358 5.9282 12.2858 6.04902 12.2858 6.175C12.2858 6.30098 12.2358 6.4218 12.1467 6.51088C12.0576 6.59996 11.9368 6.65 11.8108 6.65H5.1749C5.04892 6.65 4.92811 6.59996 4.83903 6.51088C4.74995 6.4218 4.6999 6.30098 4.6999 6.175C4.6999 6.04902 4.74995 5.9282 4.83903 5.83912C4.92811 5.75004 5.04892 5.7 5.1749 5.7ZM5.1749 7.6H11.8249C11.9509 7.6 12.0717 7.65004 12.1608 7.73912C12.2499 7.8282 12.2999 7.94902 12.2999 8.075C12.2999 8.20098 12.2499 8.3218 12.1608 8.41088C12.0717 8.49996 11.9509 8.55 11.8249 8.55H5.1749C5.04892 8.55 4.92811 8.49996 4.83903 8.41088C4.74995 8.3218 4.6999 8.20098 4.6999 8.075C4.6999 7.94902 4.74995 7.8282 4.83903 7.73912C4.92811 7.65004 5.04892 7.6 5.1749 7.6ZM8.9749 10.45H5.1749C5.04892 10.45 4.92811 10.4 4.83903 10.3109C4.74995 10.2218 4.6999 10.101 4.6999 9.975C4.6999 9.84902 4.74995 9.7282 4.83903 9.63912C4.92811 9.55004 5.04892 9.5 5.1749 9.5H8.9749C9.10088 9.5 9.2217 9.55004 9.31078 9.63912C9.39986 9.7282 9.4499 9.84902 9.4499 9.975C9.4499 10.101 9.39986 10.2218 9.31078 10.3109C9.2217 10.4 9.10088 10.45 8.9749 10.45ZM9.9249 18.05V15.2C9.9249 14.5701 10.1751 13.966 10.6205 13.5206C11.0659 13.0752 11.67 12.825 12.2999 12.825H15.1499L9.9249 18.05Z"
              fill="#172255"
            />
          </svg>
        </a>
      </div>
      <div class="folder-title current-element__title" style="
        color: ${titleStyle.color};
        font-size: ${titleStyle.fontSize};
        font-family: ${titleStyle.fontFamily};
      " contenteditable>${this._data.folderTitle}</div>
      <div class="folder-text current-element__text" style="
        color: ${textStyle.color};
        font-size: ${textStyle.fontSize};
        font-family: ${textStyle.fontFamily};
      " contenteditable>${this._data.folderText}</div>
      <div class="folder-notes"></div>
      <a class="folder-delete__btn btn--delete">Delete</a>
      <div class="edit-window">
        <div class="edit-header">
          <div class="edit-types">
            <div class="edit-type active" data-type="color">Color</div>
            <div class="edit-type" data-type="size">Size</div>
            <div class="edit-type" data-type="family">Family</div>
          </div>
          <div class="edit-btns">
            <a class="edit-submit__btn">Submit</a>
            <a class="edit-close__btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="#364FC7"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="edit-main"></div>
      </div>
    </div>
      `;
  }
}

export default new FolderView();
