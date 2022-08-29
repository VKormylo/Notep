import { LOGIN_REGEX } from "../config";

class AuthView {
  _parentElement = document.querySelector(".authentication");
  _container = document.querySelector(".container");
  _headerProfile = document.querySelector(".header-profile__user");
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
      input.type === "text"
        ? that._validateUsername()
        : that._validatePassword();
    });
  }

  login(username) {
    this._container.classList.remove("hidden");
    this._parentElement.classList.remove("visible");
    console.log(username);
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
      const valid = that._validateLogin();
      if (valid) handler(account);
    });
  }

  _validateUsername(username = this._usernameInput.value) {
    if (!username) {
      this._usernameInput.classList.add("wrong-data");
      this._usernameInput.placeholder = "Username is required";
    }
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
    if (!LOGIN_REGEX.test(password)) {
      this._passwordInput.classList.add("wrong-data");
      return;
    }
    if (password) {
      this._passwordInput.classList.remove("wrong-data");
      this._passwordInput.placeholder = "Create a password";
    }
  }

  _validateLogin() {
    this._validateUsername();
    this._validatePassword();
    if (
      !this._usernameInput.classList.contains("wrong-data") &&
      !this._passwordInput.classList.contains("wrong-data")
    )
      return true;
  }
}

export default new AuthView();
