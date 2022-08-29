import View from "./View.js";

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const prevBtn = e.target.closest(".prev-page");
      const nextBtn = e.target.closest(".next-page");
      const pageBtn = e.target.closest(".page-number");
      const clicked = prevBtn ?? nextBtn ?? pageBtn;
      if (!clicked || clicked.classList.contains("active")) return;
      const goToPage = +clicked.dataset.page;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    // Set current page and calculate number of pages
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data[this._data.type].length / this._data.resultsPerPage
    );

    // Create element (number) for each page
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(i);
    }
    const elements = pages.map(
      (page) =>
        `<div class="page-number ${
          curPage === page ? "active" : ""
        }" data-page="${page}">${page}</div>`
    );

    this._clear();

    // If there are more than one page then render pagination
    if (numPages > 1) {
      return `
          <div class="prev-page ${
            curPage === 1 ? "disabled" : ""
          }" data-page="${curPage - 1}">
            <svg
              width="10"
              height="17"
              viewBox="0 0 10 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.17739 2.56229C9.63467 2.09476 9.63481 1.3476 9.1777 0.879905C8.70587 0.397151 7.92931 0.396915 7.45719 0.879383L1.3688 7.1012C0.608082 7.87859 0.608082 9.12141 1.3688 9.8988L7.45719 16.1206C7.92931 16.6031 8.70587 16.6028 9.1777 16.1201C9.63481 15.6524 9.63467 14.9052 9.17739 14.4377L4.73761 9.89846C3.97733 9.12115 3.97733 7.87885 4.73761 7.10154L9.17739 2.56229Z"
                fill="#536DFE"
              />
            </svg>
          </div>
          <div class="numbers-page">
          ${elements.join("")}
          </div>
          <div class="next-page ${
            curPage === numPages ? "disabled" : ""
          }" data-page="${curPage + 1}">
            <svg
              width="10"
              height="17"
              viewBox="0 0 10 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.822613 14.4377C0.36533 14.9052 0.365192 15.6524 0.822302 16.1201V16.1201C1.29413 16.6028 2.07069 16.6031 2.54281 16.1206L8.6312 9.8988C9.39192 9.12141 9.39192 7.87859 8.6312 7.1012L2.54281 0.879382C2.07069 0.396915 1.29413 0.397151 0.822302 0.879904V0.879904C0.365192 1.3476 0.36533 2.09476 0.822612 2.56229L5.26239 7.10154C6.02267 7.87885 6.02267 9.12115 5.26239 9.89846L0.822613 14.4377Z"
                fill="#536DFE"
              />
            </svg>
          </div>
    `;
    }
    return "";
  }
}

export default new PaginationView();
