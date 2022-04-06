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

  /**
   * Páginas
   *
   * Para desplegar la aplicación con puppeteer en heroku se debe de instalar el paquete en el servidor de heroku:
   *
   * heroku buildpacks:add jontewks/puppeteer -a <app_name>
   *
   * @see https://www.youtube.com/watch?v=Kl7mqpAK-bk&t=267s&ab_channel=ReactNativeTutorial
   * @see https://github.com/jontewks/puppeteer-heroku-buildpack
   */
  static async openPage() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"], //
    });
    this.page = await this.browser.newPage();
  }

  static async closePage() {
    await this.page.close();
    await this.browser.close();
  }

  static async getPageTitle() {
    return this.page.title();
  }

  static async goTo(pageUrl: string) {
    return await this.page.goto(pageUrl, { waitUntil: this.waitUntil });
  }

  static async scrollingDown() {
    await this.page.evaluate(() => {
      const scroll = () => {
        const { scrollHeight } = document.body;

        window.scrollBy(0, scrollHeight);

        const newScrollHeight = document.body.scrollHeight;

        if (newScrollHeight > scrollHeight) {
          scroll();
        }
      };

      scroll();
    });
  }

  static async waitForNav() {
    return await this.page.waitForNavigation({ waitUntil: this.waitUntil });
  }

  /**
   * Inputs
   */
  static async typeInput(element: ElementHandle | null, text: string = "") {
    return await element?.type(text, { delay: 100 });
  }

  /**
   * Elementos
   */
  static async getElementByQuerySelector(querySelector: string) {
    return await this.page.$(querySelector);
  }

  static async getElementByQuerySelectorAll(querySelector: string) {
    return await this.page.$$(querySelector);
  }

  static async getElementByXPath(xPath: string) {
    return await this.page.$x(xPath);
  }

  /**
   * Elementos - Contenido
   */
  static async getElementTextContent(elementHandler: ElementHandle | null) {
    return await elementHandler?.evaluate(({ textContent }) =>
      textContent?.trim()
    );
  }

  static async getTextContentByQuerySelector(querySelector: string) {
    const elementHandler = await this.getElementByQuerySelector(querySelector);

    return await this.getElementTextContent(elementHandler);
  }

  static async getTextContentByXPath(xPath: string) {
    const [elementHandler] = await this.getElementByXPath(xPath);

    return await this.getElementTextContent(elementHandler);
  }

  /**
   * Elementos - Atributos
   */
  static async getElementAttribute(
    elementHandler: ElementHandle | null,
    atrribute: string
  ) {
    return await elementHandler?.evaluate(
      (element, atrribute) => element.getAttribute(atrribute),
      atrribute
    );
  }

  static async getAttributeByQuerySelector(
    querySelector: string,
    atrribute: string
  ) {
    const elementHandler = await this.getElementByQuerySelector(querySelector);

    return await this.getElementAttribute(elementHandler, atrribute);
  }

  static async getAttributeByXPath(xPath: string, atrribute: string) {
    const [elementHandler] = await this.getElementByXPath(xPath);

    return await this.getElementAttribute(elementHandler, atrribute);
  }
}

export default PuppeteerController;
