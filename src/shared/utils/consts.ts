export const LINKEDIN_BASE_PATH = "https://www.linkedin.com/";
export const LINKEDIN_URL_SEARCH_PEOPLE =
  LINKEDIN_BASE_PATH +
  "search/results/people/?keywords=%{keyword}&page=%{page}";

export const LINKEDIN_SELECTORS = {
  login: {
    username: "input[autocomplete='username']",
    password: "input[autocomplete='current-password']",
  },
  search: {
    subtitle: "body main h2",
    list: {
      itemLink:
        "ul.reusable-search__entity-result-list li .entity-result__title-line a",
    },
    pagination: {
      listPages: "ul.artdeco-pagination__pages",
      lastPage: "ul.artdeco-pagination__pages li:last-child span",
    },
  },
};

export const LINKEDIN_PAGE_ELEMENTS_TEXT = {
  homeTitle: "Feed | LinkedIn",
  searchTitle: '"%{keyword}" | Búsqueda | LinkedIn',
};
