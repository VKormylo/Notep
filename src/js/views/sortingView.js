import View from "./View.js";

class SortingView extends View {
  _parentElement = document.querySelector(".sorting-select");

  setSelected(sortBy) {
    // Set active sorting option to value from state
    const options = this._parentElement.querySelectorAll("option");
    options.forEach((option) =>
      option.value === sortBy ? (option.selected = true) : ""
    );
  }

  addHandlerSelect(handler) {
    // Change sorting
    const that = this;
    this._parentElement.addEventListener("change", function () {
      handler(that._parentElement.value);
    });
  }
}

export default new SortingView();
