import "dotenv/config";
import Response from "../shared/models/Response";
import {
  LINKEDING_SELECTORS,
  LINKEDIN_BASE_PATH,
  LINKEDIN_PAGE_ELEMENTS_TEXT,
} from "../shared/utils/consts";
import PuppeteerController from "./puppeteer.controller";

const { LINKEDIN_LOGIN_USERNAME, LINKEDIN_LOGIN_PASSWORD } = process.env;

const { login } = LINKEDING_SELECTORS;
const { homeTitle } = LINKEDIN_PAGE_ELEMENTS_TEXT;

class ScrapperController extends PuppeteerController {
  static async login() {
    await this.goTo(LINKEDIN_BASE_PATH);
    await this.page.waitForSelector("input");

    const usernameInput = await this.getElementByQuerySelector(login.username);
    const passwordInput = await this.getElementByQuerySelector(login.password);

    await this.typeInput(usernameInput, LINKEDIN_LOGIN_USERNAME);
    await this.typeInput(passwordInput, LINKEDIN_LOGIN_PASSWORD);

    await passwordInput?.press("Enter");

    await this.waitForNav();

    const title = await this.getPageTitle();

    return title.includes(homeTitle);
  }
}

export default ScrapperController;
