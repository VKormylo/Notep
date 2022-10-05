import { getURL } from "../helpers.js";
import EditView from "./editView.js";
import folderView from "./folderView.js";

class NoteView extends EditView {
  // Main
  _parentElement = document.querySelector(".notes");
  _container = document.querySelector(".container");
  _pagination = document.querySelector(".pagination");
  _subheader = document.querySelector(".subheader");
  // Edit
  _originalObject;
  _editedObject;
  // Add to folder
  _addToFolderBlock;
  _folderResults;
  // Note info
  _originalTitle;
  _originalText;
  // Messages
  _message = "No folders found.";
  _successMessage = "Successfully added";
  _messageBlock;

  constructor() {
    super(document.querySelector(".notes"));
    // Update subheader on url change
    this._onPageChange();
    // Toggle edit window
    this._addHandlerToggleEdit();
  }

  /* --------------------------------------------------- */
  /* ---------------- PRIVATE FUNCTIONS ---------------- */
  /* --------------------------------------------------- */

  _setFolderBlock() {
    this._addToFolderBlock = document.querySelector(".add-to-folder");
    this._messageBlock = document.querySelector(".folder-results");
    this._folderResults = document.querySelector(".folder-results");
  }

  addHandlerShowFolders(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".show-folders__btn");
      if (!btn) return;
      // Show folders
      that._toggleFolderResults();
      handler();
    });
  }

  _toggleFolderResults() {
    // Toggle folder results window
    this._addToFolderBlock.classList.toggle("visible");
    if (this._addToFolderBlock.classList.contains("visible")) {
      this._folderResults.innerHTML = "";
      this._clearInputs(document.querySelector(".show-folders__input"));
    }
  }

  /* ------------------------------------------------ */
  /* ---------------- MAIN FUNCTIONS ---------------- */
  /* ------------------------------------------------ */

  addHandlerAddToFolder(handler) {
    const that = this;
    // Get ID of the current note, ID of the folder to add in, and add note
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".folder-result__btn");
      if (!btn) return;
      const noteID = +btn.closest(".note").dataset.id;
      const folderID = +btn.closest(".folder-result").dataset.id;
      handler(noteID, folderID);
      setTimeout(that._toggleFolderResults.bind(that), 500);
      that.renderMessage(that._successMessage);
    });
  }

  // -------------------- SELECTING NOTE --------------------
  addHandlerSelectNote(handler) {
    // Hide subheader, change grid to block, select note and set variables
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const note = e.target.closest(".note-card");
      if (!note) return;
      that._onElementSelect("note");
      // Save original title and text of the note
      that._setOriginalInfo(note, "note");
      const id = +note.dataset.id;
      handler(id);
      that._setFolderBlock();
    });
  }

  addHandlerSelectFolderNote(handler) {
    const that = this;
    const folders = document.querySelector(".folders");
    folders.addEventListener("click", function (e) {
      const note = e.target.closest(".note-card");
      const removeBtn = e.target.closest(".note-remove__btn");
      if (!note || removeBtn) return;
      const folder = document.querySelector(".folder");
      // Replace folders to notes, hide subheader, change grid to block
      folders.replaceWith(that._parentElement);
      that._onElementSelect("note", true, false);
      // Select folder title, noteID
      const folderTitle = folder.querySelector(".folder-title").textContent;
      // Save original title and text of the note
      that._setOriginalInfo(note, "note");
      const noteID = +note.dataset.id;
      // Render chosen note
      handler(noteID, folderTitle, +folder.dataset.id);
      that._setFolderBlock();
    });
  }

  // -------------------- GO BACK --------------------
  addHandlerGoBack(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const link = e.target.closest(".btn-back");
      // Check if going back only from notes page
      if (!link || that._subheader.classList.contains("folder-page")) return;
      that._onElementSelect("note", false);
      handler();
    });
  }

  // -------------------- CHANGE NOTE AND SEARCH FOLDERS --------------------
  addHandlerChangeNote(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const changeBtn = e.target.closest(".note-change");
      if (!changeBtn) return;
      // Select note, updated text and title
      const note = document.querySelector(".note");
      // Save original title and text of the note, get title and text
      const [title, text] = that._setOriginalInfo(note, "note", true, true);
      // Get note and folder id
      const id = +note.dataset.id;
      const folderID = +note.dataset.folder;
      const url = getURL();
      const currentNote = {
        noteTitle: title,
        noteText: text,
        noteID: id,
        folderID: folderID ?? undefined,
      };
      // Change note or note in folder
      handler(
        folderID && url === "folders" ? "folder-note" : "note",
        currentNote
      );
    });
  }

  addHandlerSearchFolders(handler) {
    // Search folders in which note can be added
    this._parentElement.addEventListener("input", function (e) {
      const searchInput = e.target.closest(".show-folders__input");
      if (!searchInput) return;
      handler(searchInput.value.toLowerCase());
    });
  }

  // -------------------- DELETE NOTE --------------------
  addHandlerDeleteNote(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      // Trigger delete window
      const btn = e.target.closest(".note-delete__btn");
      if (!btn) return;
      that.renderDeleteWindow(handler);
    });
  }

  _addHandlerDelete(btn, handler) {
    const that = this;
    // Add event listener to confirm deletion button
    btn.addEventListener("click", function () {
      // Get IDs
      const noteID = +document.querySelector(".note").dataset.id;
      const folderID = +document.querySelector(".note").dataset.folder;
      const url = getURL();
      // If deleting from notes page
      if (url === "notes") {
        handler(noteID);
        that._onElementSelect("note", false);
      }
      // If deleting from current folder
      if (folderID && url === "folders") {
        folderView.replaceNotesWithFolders();
        handler(noteID, folderID);
      }
      // Remove delete window and hide overlay
      that._removeDeleteWindow();
    });
  }

  // -------------------- EDIT WINDOW --------------------

  _editElementStyle(type, value) {
    let element;
    // Set element to the title or text (editing)
    if (this._editElement === "title")
      element = document.querySelector(".note-title");
    if (this._editElement === "text")
      element = document.querySelector(".note-text");
    // Change element styles (color, size or fontFamily)
    if (type === "color") element.style.color = value;
    if (type === "size") element.style.fontSize = value;
    if (type === "family") element.style.fontFamily = value;
  }

  _refreshElement() {
    // Set element to the title or text of the note
    const element = document.querySelector(`.note-${this._editElement}`);
    // Get variables from original note object
    const { color, fontSize, fontFamily } =
      this._originalObject[this._editElement];
    // Set element styles to previous styles (cancel changes)
    element.style.color = color;
    element.style.fontSize = fontSize;
    element.style.fontFamily = fontFamily;
    // Rewrite edited note object (cancel changes)
    this._editedObject = JSON.parse(JSON.stringify(this._originalObject));
    // Cancel disabling
    this._disableButtons(false);
  }

  _addHandlerToggleEdit() {
    const that = this;
    // Add handler to edit title or text btn
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".note-edit__btn");
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
      // Get btn with color type
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
      const noteID = +document.querySelector(".note").dataset.id;
      // Close edit window and activate buttons
      that._editWindow.classList.remove("visible");
      that._disableButtons(false);
      // Rewrite original note object to the new one
      that._originalObject = JSON.parse(JSON.stringify(that._editedObject));
      // Send changed note object to controller and save it
      handler(noteID, that._editedObject);
    });
  }

  /* ---------------------------------------------------------- */
  /* ---------------- RENDER AND GENERATE HTML ---------------- */
  /* ---------------------------------------------------------- */

  // -------------------- FOLDER RESULTS --------------------
  renderFolderResults(folders) {
    const folderResults =
      this._addToFolderBlock.querySelector(".folder-results");
    if (!folders) return;
    // Add scroll if there are more than 8 folders, else hide it
    if (folders.length > 8) folderResults.classList.add("scroll");
    if (folders.length < 8) folderResults.classList.remove("scroll");
    // Clear old folder results and render new
    folderResults.innerHTML = "";
    // Generate HTML for each folder
    const folderElements = folders
      .map((folder) => this._generateFolderResults(folder))
      .join("");
    folderResults.insertAdjacentHTML("afterbegin", folderElements);
  }

  _generateFolderResults(folder) {
    // Render folder if it doesn't contain current note
    // If there is, simply return
    const noteID = +document.querySelector(".note").dataset.id;
    const note = folder.notes.find((note) => note.noteID === noteID);
    if (note) return;
    // Format date
    const formattedDate = this._getFormattedDate(folder.folderDate);
    return `
    <div class="folder-result" data-id="${folder.folderID}">
      <div
        class="folder-result__circle folder-circle ${folder.folderColor}"
      ></div>
      <div class="folder-result__info">
        <div class="folder-result__title">${folder.folderTitle}</div>
        <div class="folder-result__date">${formattedDate}</div>
      </div>
      <a class="folder-result__btn">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.82434 0.00323334C5.63963 0.021055 5.44734 0.0745198 5.30336 0.14862C4.9832 0.313705 4.74261 0.63637 4.64883 1.02845C4.59768 1.24043 4.59958 1.17571 4.59579 2.95881L4.592 4.61247H2.97035C1.2142 4.61247 1.2284 4.61247 1.00865 4.66312C0.626917 4.75317 0.30865 4.98766 0.150463 5.29719C0.0424795 5.51012 -0.0105651 5.77932 0.00174882 6.06352C0.0178516 6.43684 0.149516 6.74262 0.40053 6.99119C0.589975 7.17784 0.793629 7.2904 1.05885 7.35231C1.25209 7.39827 1.23219 7.39827 2.96561 7.39827H4.592L4.59579 9.05099C4.59958 10.835 4.59768 10.7703 4.64883 10.9823C4.74355 11.3772 4.97562 11.6867 5.30052 11.8518C5.41798 11.9118 5.53638 11.9503 5.68131 11.9775C5.84044 12.0075 6.14924 12.0075 6.30932 11.9775C6.59348 11.925 6.79619 11.8208 6.98469 11.6342C7.20634 11.4128 7.33043 11.1549 7.38347 10.8031C7.39863 10.7046 7.40052 10.5499 7.40336 9.0463L7.40715 7.39827H9.03354C10.8219 7.39827 10.785 7.39921 11.0142 7.34105C11.3931 7.24444 11.6914 7.01276 11.8534 6.68634C11.9965 6.40026 12.0391 5.9913 11.9624 5.63018C11.8837 5.25311 11.6517 4.95483 11.3021 4.77943C11.1885 4.72127 11.1222 4.69782 10.9877 4.66406C10.7812 4.61247 10.7878 4.61247 9.0288 4.61247H7.40715L7.40336 2.95881C7.40052 1.49181 7.39863 1.29483 7.38442 1.20572C7.32853 0.838974 7.19213 0.569773 6.94585 0.335278C6.77156 0.169256 6.57359 0.0726439 6.31216 0.0248069C6.20986 0.00604728 5.92759 -0.00614646 5.82434 0.00323334Z" fill="#536DFE"/>
        </svg>
      </a>
    </div>
    `;
  }

  // -------------------- DELETE WINDOW --------------------
  _generateDeleteWindow() {
    return `
      <div class="deleting-window">
          <div class="deleting-name">Deleting note</div>
          <div class="deleting-title">You want to delete the note, are you sure?</div>
          <div class="deleting-subtitle">All data of the note will be deleted.</div>
          <div class="deleting-btns">
            <a class="deleting-cancel">No</a>
            <a class="deleting-confirm btn--delete">Yes</a>
          </div>
        </div>
    `;
  }

  // -------------------- NOTE --------------------
  _generateMarkup(element) {
    // Format date
    const formattedDate = this._getFormattedDate(this._data.noteDate);
    // Cut note title if it's too long
    const title = element?.length > 20 ? element.slice(1, 20) + "..." : element;
    // Set original note object and edited object to a DEEP copy from state
    this._originalObject = JSON.parse(JSON.stringify(this._data.noteStyle));
    this._editedObject = JSON.parse(JSON.stringify(this._data.noteStyle));
    // Get title and text style objects for easier use
    const { title: titleStyle, text: textStyle } = this._data.noteStyle;
    this._clear();
    return `
    <div class="note" data-id="${this._data.noteID}" ${
      this._data.folderID ? `data-folder = "${this._data.folderID}"` : ""
    }>
    <div class="note-top element-page__top">
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
        <a class="link-back">${!element ? "All notes" : "Back to: " + title}</a>
      </div>
      <div class="note-date element-date">${formattedDate}</div>
      <div class="element-edit__btns">
        <a class="element-edit__title element-edit__btn note-edit__btn" data-element="title">
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
        <a class="element-edit__text element-edit__btn note-edit__btn" data-element="text">
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
      <div class="note-change current-element__change btn--simple btn--reverse">Change</div>
    </div>
    <div class="add-to-folder">
      <div class="show-folders">
        <a class="show-folders__btn btn--square">
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.2 1.75H9L7.7274 0.51275C7.3899 0.184625 6.9318 0 6.4548 0H1.8C0.81 0 0 0.7875 0 1.75V12.25C0 13.2125 0.81 14 1.8 14H16.2C17.19 14 18 13.2125 18 12.25V3.5C18 2.5375 17.19 1.75 16.2 1.75Z"
              fill="#172255"
            />
          </svg>
        </a>
        <input
          class="show-folders__input"
          type="text"
          placeholder="Add to folder"
        />
      </div>
      <div class="folder-results"></div>
    </div>
    <a class="note-delete__btn btn--delete">Delete</a>
    <div class="note-title current-element__title" style="
      color: ${titleStyle.color};
      font-size: ${titleStyle.fontSize};
      font-family: ${titleStyle.fontFamily};
    " contenteditable>${this._data.noteTitle}</div>
    <div class="note-text current-element__text" style="
      color: ${textStyle.color};
      font-size: ${textStyle.fontSize};
      font-family: ${textStyle.fontFamily};
    " contenteditable>${this._data.noteText}</div>
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

export default new NoteView();
