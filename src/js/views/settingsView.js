import View from "./View";

class SettingsView extends View {
  _parentElement = document.querySelector(".settings");
  // Submit delete window
  _accountDelete;
  // Delete form
  _warnMessage;
  _password;
  _confirmPassword;

  constructor() {
    super();
    this._addHandlerCancelDelete();
  }

  addHandlerSubmitPassword(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".account-del__btn");
      if (!btn) return;
      // Set variables
      that._password = document.querySelector(".account-form__input");
      that._confirmPassword = document.querySelector(
        ".account-form__input.password-confirm"
      );
      that._accountDelete = document.querySelector(".account-delete");
      that._warnMessage = document.querySelector(".account-warn");
      // Validate inputs (in controller)
      handler(that._password.value, that._confirmPassword.value);
    });
  }

  addHandlerSubmitDelete(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".account-delete__submit");
      if (!btn) return;
      // Delete account
      handler();
    });
  }

  _addHandlerCancelDelete() {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".account-delete__cancel");
      if (!btn) return;
      // Hide submit delete window
      that._hideOverlay();
      that._accountDelete.classList.remove("visible");
      // Clear inputs
      that._password.value = "";
      that._confirmPassword.value = "";
    });
  }

  validatePassword(err) {
    // If password inputs are invalid
    if (err) {
      this._password.classList.add("wrong-password");
      this._confirmPassword.classList.add("wrong-password");
      this._warnMessage.classList.add("error");
    }
    // If password inputs are valid
    if (!err) {
      this._password.classList.remove("wrong-password");
      this._confirmPassword.classList.remove("wrong-password");
      this._showOverlay();
      // Show submit delete window
      this._accountDelete.classList.add("visible");
      this._warnMessage.classList.remove("error");
    }
  }

  _generateMarkup() {
    // Generate account settings HTML
    return `
      <div class="account-settings">
        <div class="account-block">
          <div class="account-title">Account</div>
          <div class="account-name">Account name: <span>${this._data.username}</span></div>
          <div class="account-subtitle">
            Want to delete the account? Here you go:
          </div>
          <form class="account-form">
            <div class="account-form__item">
              <label>Enter your password:</label>
              <input class="account-form__input" type="password" placeholder="Password"/>
            </div>
            <div class="account-form__item">
              <label>Confirm your password:</label>
              <input class="account-form__input password-confirm" type="password" placeholder="Password"/>
            </div>
            <div class="account-warn">Password is invalid, please try again</div>
            <a class="account-del__btn btn--primary">Delete</a>
          </form>
          <div class="account-delete">
            <div class="account-delete__title">
              Are you sure you want to delete your account?
            </div>
            <div class="account-delete__text">
              Warning: This cannot be undone. All data will be deleted.
            </div>
            <div class="account-delete__btns">
              <a class="account-delete__cancel account-delete__btn">Cancel</a>
              <a class="account-delete__submit account-delete__btn">Delete</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export default new SettingsView();
