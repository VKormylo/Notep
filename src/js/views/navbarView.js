import { getURL } from "../helpers";

class NavbarView {
  _parentElement = document.querySelector(".navbar");
  _headerProfile = document.querySelector(".header-profile");
  _subheader = document.querySelector(".subheader");
  _links = document.querySelectorAll(".navbar-li");
  _container = document.querySelector(".container");

  _addNote = this._subheader.querySelector(".add-note");
  _addFolder = this._subheader.querySelector(".add-folder");

  constructor() {
    this._updateSubheader();
  }

  setUrl(handler) {
    // Set default url
    const activeLink = this._parentElement.querySelector(".navbar-li.active");
    const url = activeLink.dataset.url;
    location.hash = url;
    handler();
  }

  addHandlerChangeUrl(handler) {
    const that = this;
    this._parentElement.addEventListener("click", function (e) {
      const link = e.target.closest(".navbar-li");
      if (!link) return;
      // Remove active link class
      that._links.forEach((link) => (link.className = "navbar-li"));
      // Add class active to clicked link
      link.classList.add("active");
      // Change url to the url of clicked link
      const url = link.dataset.url;
      // Check for current url and url of the link are not the same
      if (location.hash.slice(1) !== url) {
        location.hash = url;
        handler();
        that._updateSubheader();
      }
    });
    // Change pages on url change
    window.addEventListener("hashchange", function () {
      const url = getURL();
      if (url !== "account") {
        that._container.className = "container";
        document.querySelector(".settings").innerHTML = "";
      }
      if (url !== "notes" && url !== "folders") return;
      // Remove active link class
      that._links.forEach((link) => (link.className = "navbar-li"));
      // Add class active to clicked link
      const link = Array.from(that._links).find(
        (link) => link.dataset.url === url
      );
      link.classList.add("active");
      handler(url);
      that._updateSubheader();
    });
  }

  addHandlerOpenSettings(handler) {
    const that = this;
    this._headerProfile.addEventListener("click", function () {
      const url = "account";
      that._links.forEach((link) => (link.className = "navbar-li"));
      location.hash = url;
      that._container.classList.add("subheader-hidden");
      that._container.classList.add("account");
      handler(url);
    });
  }

  _updateSubheader() {
    const url = getURL();
    if (url === "notes") {
      this._subheader.className = "subheader note-page";
    }
    if (url === "folders") {
      this._subheader.className = "subheader folder-page";
    }
  }
}

export default new NavbarView();
