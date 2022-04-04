import puppeteer, {
  Browser,
  ElementHandle,
  Page,
  PuppeteerLifeCycleEvent,
} from "puppeteer";

class PuppeteerController {
  static browser: Browser;
  static page: Page;

  private static waitUntil: PuppeteerLifeCycleEvent = "networkidle2";

  static async closePage() {
    this.page.close();
    this.browser.close();
  }

  static async getElementByQuerySelector(querySelector: string) {
    return await this.page.$(querySelector);
  }

  static async getElementByXPath(xPath: string) {
    return await this.page.$x(xPath);
  }

  static async getPageTitle() {
    return this.page.title();
  }

  static async goTo(pageUrl: string) {
    return await this.page.goto(pageUrl, { waitUntil: this.waitUntil });
  }

  static async openPage() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  static async typeInput(element: ElementHandle | null, text: string = "") {
    return await element?.type(text, { delay: 100 });
  }

  static async waitForNav() {
    return await this.page.waitForNavigation({ waitUntil: this.waitUntil });
  }
}

export default PuppeteerController;
