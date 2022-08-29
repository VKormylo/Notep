class SearchView {
  _parentElement = document.querySelector(".search");
  _searchInput = document.querySelector(".search-input");

  addHandlerSearch(handler) {
    this._searchInput.addEventListener("input", function (e) {
      const query = e.target.value;
      handler(query);
    });
  }

  addHandlerClearSearch(handler) {
    // Clear search input on every hashchange
    const that = this;
    window.addEventListener("hashchange", function () {
      if (that._searchInput.value) {
        that._searchInput.value = "";
        handler();
      }
    });
  }
}

export default new SearchView();
