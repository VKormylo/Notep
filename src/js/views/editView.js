import View from "./View";

export default class EditView extends View {
  _editWindow;
  _editElement;

  constructor(parent) {
    super();
    // Set parent element to the child's (notes or folders)
    this._parentElement = parent;
    // Call all handlers
    this._addHandlerEditAll();
    this._addHandlerSelectType();
    this._addHandlerCloseEdit();
  }

  // -------------------- HELPERS --------------------

  _disableButtons(disable = true) {
    let element;
    // Set element to the clicked button (title or text)
    if (this._editElement === "title") {
      element = document.querySelector(".element-edit__text");
    }
    if (this._editElement === "text") {
      element = document.querySelector(".element-edit__title");
    }
    // Disable or activate button
    disable
      ? element.classList.add("disabled")
      : element.classList.remove("disabled");
  }

  _setActiveStyle(type) {
    // Get variables from edited object
    const { color, fontSize, fontFamily } =
      this._editedObject[this._editElement];
    let activeElement;
    // Set active element to clicked option
    if (type === "color") {
      // Get all presets (default values)
      const colors = document.querySelectorAll(".edit-color__circle");
      // Set active element to the current color
      activeElement = Array.from(colors).find(
        (element) => element.dataset.color === color
      );
      // If current value is input (no active presets)
      if (!activeElement) {
        activeElement = document.querySelector(".edit-color__input");
        activeElement.value = color;
      }
    }
    if (type === "size") {
      // Get all presets (default values)
      const sizes = document.querySelectorAll(".edit-size__preset");
      // Set active element to the current size
      activeElement = Array.from(sizes).find(
        (element) => element.dataset.size === fontSize
      );
      // If current value is input (no active presets)
      if (!activeElement) {
        activeElement = document.querySelector(".edit-size__input");
        // Slice font size (remove px -> 14px = 14)
        activeElement.value = fontSize.slice(0, 2);
      }
    }
    if (type === "family") {
      // Get all presets (default values)
      const fonts = document.querySelectorAll(".edit-family__preset");
      // Set active element to the current fontFamily
      activeElement = Array.from(fonts).find(
        (element) => element.dataset.family === fontFamily
      );
    }
    // Add active class to active element (emphasize)
    activeElement.classList.add("active");
  }

  _rewriteActiveClass(classname, item) {
    // Select all elements (colors, sizes, families)
    const elements = document.querySelectorAll(`.${classname}`);
    // Remove active class from all
    elements.forEach((element) => element.classList.remove("active"));
    // Add active class to the selected one
    item.classList.add("active");
  }

  // -------------------- MAIN FUNCTIONS (HANDLERS) --------------------

  _addHandlerSelectType() {
    const that = this;
    // Add handler to edit-type button (edit color, etc.)
    this._parentElement.addEventListener("click", function (e) {
      const type = e.target.closest(".edit-type");
      if (!type) return;
      // Get edit type (f.e. "color")
      const editType = type.dataset.type;
      // Set active class to current type
      that._rewriteActiveClass("edit-type", type);
      // Render main edit block for current type
      that._renderEditType(editType);
    });
  }

  _addHandlerEditAll() {
    // Add handlers to all edit type buttons
    // Editing color, size, family
    this._addHandlerEditColor();
    this._addHandlerEditSize();
    this._addHandlerEditFamily();
  }

  _addHandlerEditColor() {
    const that = this;
    // Add event listener to all color presets (NOT input)
    this._parentElement.addEventListener("click", function (e) {
      const colorItem = e.target.closest(".edit-color__circle");
      if (!colorItem) return;
      // Get color (HEX) from selected color
      const color = colorItem.dataset.color;
      // Set active class to current preset
      that._rewriteActiveClass("edit-color__circle", colorItem);
      // Change element's title or text color to the selected
      that._editElementStyle("color", color);
      // Change object to submit changes later
      that._editedObject[that._editElement].color = color;
    });

    // Add event listener to color input
    this._parentElement.addEventListener("change", function (e) {
      const colorInput = e.target.closest(".edit-color__input");
      if (!colorInput) return;
      // Get color (HEX) from input
      const color = colorInput.value;
      that._editElementStyle("color", color);
      that._editedObject[that._editElement].color = color;
    });
  }

  _addHandlerEditSize() {
    const that = this;
    // Add event listener to size input
    this._parentElement.addEventListener("input", function (e) {
      const sizeInput = e.target.closest(".edit-size__input");
      if (!sizeInput) return;
      // Get size (f.e. 14px) from input
      const size = sizeInput.value;
      // If size is less or bigger than should be, add warn class, else remove
      if (size > 32 || size < 10 || !size) sizeInput.classList.add("warn");
      else sizeInput.classList.remove("warn");
    });

    // Add event listener to input submit button
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-size__submit");
      if (!btn) return;
      const sizeInput = document.querySelector(".edit-size__input");
      const size = `${sizeInput.value}px`;
      // Validate size input
      if (sizeInput.value > 32 || sizeInput.value < 10 || !sizeInput.value)
        sizeInput.classList.add("warn");
      // If size is OK, change size
      if (!sizeInput.classList.contains("warn")) {
        that._editElementStyle("size", size);
        that._editedObject[that._editElement].fontSize = size;
        sizeInput.value = "";
      }
    });

    // Add event listener to all size presets (NOT input)
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-size__preset");
      if (!btn) return;
      // Get size (f.e. 14px) from preset
      const size = btn.dataset.size;
      that._rewriteActiveClass("edit-size__preset", btn);
      that._editElementStyle("size", size);
      that._editedObject[that._editElement].fontSize = size;
    });
  }

  _addHandlerEditFamily() {
    const that = this;
    // Add event listener to all font family presets (NOT input)
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-family__preset");
      if (!btn) return;
      // Get font family (f.e. Roboto) from preset
      const fontFamily = btn.dataset.family;
      that._rewriteActiveClass("edit-family__preset", btn);
      that._editElementStyle("family", fontFamily);
      that._editedObject[that._editElement].fontFamily = fontFamily;
    });
  }

  _addHandlerCloseEdit() {
    const that = this;
    // Add event listener to close edit button
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-close__btn");
      if (!btn) return;
      // Cancel all changes
      that._refreshElement();
      // Close edit window
      that._editWindow.classList.remove("visible");
    });
  }

  /* ---------------------------------------------------------- */
  /* ---------------- RENDER AND GENERATE HTML ---------------- */
  /* ---------------------------------------------------------- */

  _renderEditType(type) {
    // Get main edit block (edit color -> default colors, color input)
    const editMain = this._editWindow.querySelector(".edit-main");
    // Delete main edit block from DOM
    editMain.remove();
    // Generate new main edit block (color -> size or family)
    const markup = this._generateEdit(type);
    // Insert it to the DOM
    this._editWindow.insertAdjacentHTML("beforeend", markup);
    // Activate current color, size, family
    this._setActiveStyle(type);
  }

  _generateEdit(type) {
    // Generate main edit block that is current type
    if (type === "color") {
      return `
      <div class="edit-color edit-main">
        <div class="edit-color__presets edit-presets">
          <div class="edit-color__circle circle--ocean" data-color="#00C2FF"></div>
          <div class="edit-color__circle circle--primary" data-color="#536dfe"></div>
          <div class="edit-color__circle circle--tertiary" data-color="#364fc7"></div>
          <div class="edit-color__circle circle--dark" data-color="#172255"></div>
          <div class="edit-color__circle circle--violet" data-color="#9e3dff"></div>
          <div class="edit-color__circle circle--red" data-color="#FF005C"></div>
        </div>
        <input class="edit-color__input" type="color" />
      </div>
      `;
    }

    if (type === "size") {
      return `
        <div class="edit-size edit-main">
          <div class="edit-size__choose">
            <input
              class="edit-size__input"
              type="number"
              placeholder="Size (10-32)"
              min="10"
              max="32"
            />
            <a class="edit-size__submit">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                <path
                  d="M7.979 14.646q-.167 0-.323-.063-.156-.062-.302-.208l-3.521-3.521q-.25-.25-.239-.635.01-.386.26-.636t.625-.25q.375 0 .625.25L8.021 12.5l6.896-6.896q.25-.25.614-.25.365 0 .615.25t.25.615q0 .364-.25.614l-7.542 7.542q-.146.146-.302.208-.156.063-.323.063Z"
                />
              </svg>
            </a>
          </div>
          <div class="edit-size__presets edit-presets">
            <div class="edit-size__preset" data-size="16px">16px</div>
            <div class="edit-size__preset" data-size="18px">18px</div>
            <div class="edit-size__preset" data-size="20px">20px</div>
            <div class="edit-size__preset" data-size="26px">26px</div>
            <div class="edit-size__preset" data-size="32px">32px</div>
          </div>
        </div>
      `;
    }

    if (type === "family") {
      return `
        <div class="edit-family edit-main">
          <div class="edit-family__presets edit-presets">
            <div class="edit-family__preset" data-family="Roboto">Roboto</div>
            <div class="edit-family__preset" data-family="Rubik">Rubik</div>
            <div class="edit-family__preset" data-family="Lato">Lato</div>
            <div class="edit-family__preset" data-family="Merriweather">Merriweather</div>
            <div class="edit-family__preset" data-family="Courgette">Courgette</div>
          </div>
        </div>
      `;
    }
  }
}
