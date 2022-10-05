export default class View {
  _data;
  _overlay = document.querySelector(".overlay");
  _dateOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };

  /* --------------------------------------------------- */
  /* ---------------- PRIVATE FUNCTIONS ---------------- */
  /* --------------------------------------------------- */

  _clear() {
    this._parentElement.innerHTML = "";
  }

  _getFormattedDate(elementDate) {
    // Format element's(note or folder) date to more beautiful
    const date = new Date(elementDate);
    return date.toLocaleDateString("en-US", this._dateOptions);
  }

  // -------------------- OVERLAY MANIPULATION --------------------
  _showOverlay() {
    this._overlay.classList.remove("hidden");
  }

  _hideOverlay() {
    this._overlay.classList.add("hidden");
  }

  // -------------------- INPUTS MANIPULATION --------------------
  _validateInputs(input, ...values) {
    if (!values) {
      // Return to default input
      input.placeholder = "Enter note title";
      input.classList.remove("wrong-data");
    }
    // Validate values (title and text)
    if (values.every((value) => value !== "")) {
      input.placeholder = "Enter note title";
      input.classList.remove("wrong-data");
      return true;
    } else {
      input.placeholder = "Both inputs shouldn't be empty!";
      input.classList.add("wrong-data");
    }
  }

  _clearInputs(...inputs) {
    inputs.forEach((input) => (input.value = ""));
  }

  // -------------------- NOTE AND FOLDER/ELEMENT PAGE --------------------
  _onElementSelect(element, select = true, add = true) {
    // On element select (going to current note or folder)
    if (select) {
      this._parentElement.className = `${element}s current`;
      this._pagination.innerHTML = "";
      add ? this._container.classList.add("subheader-hidden") : "";
    }
    // On going back to prev page (f.e. notes or folders)
    if (!select) {
      this._parentElement.className = `${element}s all`;
      this._container.classList.contains("subheader-hidden")
        ? this._container.classList.remove("subheader-hidden")
        : "";
    }
  }

  _setOriginalInfo(parent, element, change = false, get = false) {
    let title;
    let text;
    // Execute on element change
    if (change) {
      title = parent.querySelector(`.${element}-title`).textContent;
      text = parent.querySelector(`.${element}-text`).textContent;
    }
    // Execute on going to current note or folder
    if (!change) {
      title = parent.querySelector(`.${element}-card__title`).textContent;
      text = parent.querySelector(`.${element}-card__text`).textContent;
    }
    // Set original title and text of the element to check it's change later
    this._originalTitle = title;
    this._originalText = text;
    // If title and text elements are needed then return them
    if (get) {
      return [title, text];
    }
  }

  _onPageChange() {
    const that = this;
    window.addEventListener("hashchange", function () {
      // If in current note or folder
      if (
        that._container.classList.contains("subheader-hidden") ||
        that._parentElement.classList.contains("current")
      ) {
        if (location.hash === "#account") return;
        that._container.classList.remove("subheader-hidden");
        that._parentElement.className = "notes all";
      }
    });
  }

  _removeDeleteWindow() {
    // Select delete window and remove it from HTML
    const deleteWindow = document.querySelector(".deleting-window");
    if (deleteWindow) deleteWindow.remove();
    this._hideOverlay();
  }

  /* ------------------------------------------------ */
  /* ---------------- MAIN FUNCTIONS ---------------- */
  /* ------------------------------------------------ */

  addHandlerOnChange() {
    const that = this;
    this._parentElement.addEventListener("input", function () {
      // Getting all needed elements (btn, title, text) of the element
      const changeBtn = that._parentElement.querySelector(
        ".current-element__change"
      );
      const titleValue = that._parentElement.querySelector(
        ".current-element__title"
      ).textContent;
      const textValue = that._parentElement.querySelector(
        ".current-element__text"
      ).textContent;
      // Setting original title and text
      const originalTitle = that._originalTitle;
      const originalText = that._originalText;
      if (!titleValue && !textValue) return;
      // If new title and text is different from original show change button
      if (titleValue !== originalTitle || textValue !== originalText) {
        changeBtn.classList.add("edited");
      }
      // If new title and text is the same as original hide change button
      if (titleValue == originalTitle && textValue == originalText) {
        changeBtn.classList.remove("edited");
      }
    });
  }

  /* ---------------------------------------------- */
  /* ---------------- MAIN RENDERS ---------------- */
  /* ---------------------------------------------- */

  render(data, render = true, element) {
    // Setting data to render data
    this._data = data;
    // Generate markup and pass element if needed
    const markup = this._generateMarkup(element);
    // If rendering multiple items then just return them
    if (this._data.length === 0) return;
    if (!render) return markup;
    // Clear parent element
    this._clear();
    // Render new markup
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderDeleteWindow(handler) {
    // Generate delete window for note or folder
    const markup = this._generateDeleteWindow();
    this._showOverlay();
    // Insert delete window
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
    // Select needed buttons
    const cancelBtn = document.querySelector(".deleting-cancel");
    const confirmBtn = document.querySelector(".deleting-confirm");
    // Add event listeners to the buttons above
    cancelBtn.addEventListener("click", this._removeDeleteWindow.bind(this));
    this._addHandlerDelete(confirmBtn, handler);
  }

  renderMessage(message = this._message, classname = "", search = false) {
    // Change message if there are no search results
    if (search) message = this._searchMessage;
    // Generate message markup
    const markup = `<div class="${
      classname ? classname : "message"
    }">${message}</div>`;
    // Clear message container
    this._messageBlock.innerHTML = "";
    // Render new message
    this._messageBlock.insertAdjacentHTML("afterbegin", markup);
    return this._message;
  }
}
