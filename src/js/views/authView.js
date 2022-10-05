import { LOGIN_REGEX } from "../config";

class AuthView {
  _parentElement = document.querySelector(".authentication");
  _container = document.querySelector(".container");
  _headerProfile = document.querySelector(".header-profile__user");
  _errMessage = document.querySelector(".auth-form__message");
  _usernameInput = document.querySelector(".auth-form__username");
  _passwordInput = document.querySelector(".auth-form__password");
  _btn = document.querySelector(".auth-form__btn");

  constructor() {
    this._addHandlerOnChange();
  }

  showSignUpWindow() {
    this._container.classList.add("hidden");
    this._parentElement.classList.add("visible");
  }

  _addHandlerOnChange() {
    const that = this;
    this._parentElement.addEventListener("input", function (e) {
      const input = e.target.closest(".auth-form__input");
      // Validate username or password
      input.type === "text"
        ? that._validateUsername()
        : that._validatePassword();
    });
  }

  login(username) {
    // Hide sign in window and log in account
    this._container.classList.remove("hidden");
    this._parentElement.classList.remove("visible");
    this._headerProfile.textContent = username;
  }

  addHandlerCreateAccount(handler) {
    const that = this;
    this._btn.addEventListener("click", function () {
      const username = that._usernameInput.value;
      const password = that._passwordInput.value;
      const account = {
        username: username,
        password: password,
      };
      // If data is valid then log in
      const valid = that._validateLogin();
      if (valid) handler(account);
    });
  }

  _validateUsername(username = this._usernameInput.value) {
    if (!username) {
      this._usernameInput.classList.add("wrong-data");
      this._usernameInput.placeholder = "Username is required";
    }
    // If inputs include other symbols then show error
    if (!LOGIN_REGEX.test(username)) {
      this._usernameInput.classList.add("wrong-data");
      return;
    }
    if (username) {
      this._usernameInput.classList.remove("wrong-data");
      this._usernameInput.placeholder = "Create a username";
    }
  }

  _validatePassword(password = this._passwordInput.value) {
    if (!password) {
      this._passwordInput.classList.add("wrong-data");
      this._passwordInput.placeholder = "Password is required";
    }
    // If inputs include other symbols then show error
    if (!LOGIN_REGEX.test(password)) {
      this._passwordInput.classList.add("wrong-data");
      return;
    }
    // If password is less than 8 symbols then show error
    if (password.length < 8) {
      this._passwordInput.classList.add("wrong-data");
      this._errMessage.classList.add("warn");
      return;
    }
    if (password.length >= 8) {
      this._passwordInput.classList.remove("wrong-data");
      this._passwordInput.placeholder = "Create a password";
      this._errMessage.classList.remove("warn");
    }
  }

  _validateLogin() {
    this._validateUsername();
    this._validatePassword();
    // If all data is correct then log in
    if (
      !this._usernameInput.classList.contains("wrong-data") &&
      !this._passwordInput.classList.contains("wrong-data") &&
      this._passwordInput.value.length >= 8
    )
      return true;
  }
}

export default new AuthView();
