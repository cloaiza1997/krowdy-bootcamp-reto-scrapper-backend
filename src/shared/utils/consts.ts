export const LINKEDIN_BASE_PATH = "https://www.linkedin.com/";
export const LINKEDIN_URL_SEARCH_PEOPLE =
  LINKEDIN_BASE_PATH +
  "search/results/people/?keywords=%{keyword}&page=%{page}";

const PROFILE_CONTACT_INFO_XPATH_PREFIX =
  "//section[contains(@class,'pv-profile-section')]//div[contains(@class,'pv-profile-section__section-info')]//section";

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
    profileInfo: {
      avatar: "//body//main//section/div[2]/div/div//img",
      name: "body main section h1",
      position: "//body//main//section/div[2]/div[2]/div/div[2]",
      location: "//body//main//section/div[2]/div[2]/div[2]/span",
      buttonContactInfo: "//body//main//section/div[2]/div[2]/div[2]/span[2]/a",
      dialogContactInfo: ".artdeco-modal section.pv-profile-section",
      websites:
        PROFILE_CONTACT_INFO_XPATH_PREFIX +
        "[contains(@class,'ci-websites')]//a",
      phone:
        PROFILE_CONTACT_INFO_XPATH_PREFIX +
        "[contains(@class,'ci-phone')]//ul/li/span",
      address:
        PROFILE_CONTACT_INFO_XPATH_PREFIX +
        "[contains(@class,'ci-address')]//a",
      email:
        PROFILE_CONTACT_INFO_XPATH_PREFIX + "[contains(@class,'ci-email')]//a",
    },
  },
};

export const LINKEDIN_PAGE_ELEMENTS_TEXT = {
  homeTitle: "Feed | LinkedIn",
  searchTitle: '"%{keyword}" | Búsqueda | LinkedIn',
};
