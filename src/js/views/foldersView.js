import addElementView from "./addElementView.js";
import View from "./View.js";

class FoldersView extends View {
  _parentElement = document.querySelector(".folders");
  _notes = document.querySelector(".notes");
  _messageBlock = document.querySelector(".folders");
  _message = "It seems like there are no folders, let’s create them!";
  _searchMessage = "Oops, no folders found!";

  _generateMarkup() {
    // Clear folders container
    this._clear();
    this._notes.replaceWith(this._parentElement);
    // Render warn message if there are no folders
    if (this._data.length === 0)
      return this.renderMessage(undefined, "main-message");
    // Render all folders from data
    return this._data
      .map((folder) => addElementView.render(folder, false, "folder"))
      .join("");
  }
}

export default new FoldersView();
