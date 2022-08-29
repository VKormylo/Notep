import addElementView from "./addElementView.js";
import View from "./View.js";

class NotesView extends View {
  _parentElement = document.querySelector(".notes");
  _folders = document.querySelector(".folders");
  _messageBlock = document.querySelector(".notes");
  _message = "It seems like there are no notes, let’s create them!";
  _searchMessage = "Oops, no notes found!";

  _generateMarkup() {
    // Clear notes container
    this._clear();
    this._folders.replaceWith(this._parentElement);
    // Render warn message if there are no notes
    if (this._data.length === 0)
      return this.renderMessage(undefined, "main-message");
    // Render all notes from data
    if (this._data.length)
      return this._data
        .map((note) => addElementView.render(note, false, "note"))
        .join("");
  }
}

export default new NotesView();
