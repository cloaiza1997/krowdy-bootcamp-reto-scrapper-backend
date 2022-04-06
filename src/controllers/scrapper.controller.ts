import "dotenv/config";
import Response from "../shared/models/Response";
import {
  LINKEDIN_SELECTORS,
  LINKEDIN_BASE_PATH,
  LINKEDIN_PAGE_ELEMENTS_TEXT,
  LINKEDIN_URL_SEARCH_PEOPLE,
} from "../shared/utils/consts";
import { homologateString } from "../shared/utils/functions";
import PuppeteerController from "./puppeteer.controller";

const { LINKEDIN_LOGIN_USERNAME, LINKEDIN_LOGIN_PASSWORD } = process.env;

const { homeTitle, searchTitle } = LINKEDIN_PAGE_ELEMENTS_TEXT;
const { login, search } = LINKEDIN_SELECTORS;
const { pagination, list } = search;

class ScrapperController extends PuppeteerController {
  /**
   * Inicia la sesión en linkedin
   */
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

    const success = title.includes(homeTitle);

    return success;
  }

  /**
   * Realiza la consulta de una página de búsqueda pára obtener los enlaces de acceso a los perfiles
   * @param keyword Palabra a consultar
   * @param page Número de página a visitar
   */
  static async getProfileSearchListByPage(
    keyword: string,
    page: number = 1
  ): Promise<ProfileSearchListByPageInterface> {
    const searchUrl = homologateString(LINKEDIN_URL_SEARCH_PEOPLE, {
      keyword,
      page,
    });

    await this.goTo(searchUrl);
    await this.page.waitForSelector("h2");

    const title = await this.getPageTitle();
    const isSearchPage = title.includes(
      homologateString(searchTitle, { keyword })
    );

    // + Validación si la página corresponde a la búsqueda
    if (!isSearchPage) {
      return { success: false };
    }

    await this.scrollingDown();

    // Extrae el subtítulo de la página: "Aproximadamente n resultados"
    const subtitle = await this.getTextContentByQuerySelector(search.subtitle);
    // Se extrae el total de resultados
    const totalResultsText = subtitle?.replace(/([^\d])/gim, "");
    const totalResults = parseInt(totalResultsText || "", 10);

    // Se espera hasta que cargue la sección de la paginación
    await this.page.waitForSelector(pagination.listPages);

    // Última página de la paginación
    const lastPageText = await this.getTextContentByQuerySelector(
      pagination.lastPage
    );
    const lastPage = parseInt(lastPageText || "", 10);

    // Se extrae el listado de resultados de la página, obtiendo el botón que contiene la url del perfil de cada resultado
    const profilesListHandler = await this.getElementByQuerySelectorAll(
      list.itemLink
    );

    const profileList: string[] = [];

    // Se extrae de cada elemento el enlace al perfil
    await Promise.all(
      profilesListHandler.map(async (profile) => {
        const href = await profile.evaluate((element) =>
          element.getAttribute("href")
        );

        if (href) {
          profileList.push(href.split("?")[0]);
        }

        return href;
      })
    );

    return {
      success: true,
      totalResults,
      lastPage,
      profileList,
    };
  }

  /**
   * Realiza la consulta de las páginas de búsqueda de acuerdo con el total de páginas
   * @param keyword Palabra a buscar
   * @param totalPages Total de página a recorrer
   * @returns
   */
  static async getProfilesList(keyword: string, totalPages: number = 3) {
    let errorPages = [];
    let profileList: string[] = [];
    let result!: ProfileSearchListByPageInterface;

    // Se consulta página por página de acuerdo con el límite total
    for (let i = 0; i < totalPages; i += 1) {
      const page = i + 1;

      result = await this.getProfileSearchListByPage(keyword, page);

      const { success, lastPage = 0 } = result;

      if (success) {
        profileList = profileList.concat(result.profileList || []);
      } else {
        errorPages.push(page);
      }

      if (page + 1 > lastPage) {
        break;
      }
    }

    return { ...result, profileList, errorPages };
  }

  /**
   * Realiza el scrapping de perfiles de linkedin
   */
  static async scrapLinkedin(
    { body: { keyword, totalPages } }: any,
    reply: any
  ) {
    let success = false;
    let result!: ProfileSearchListByPageInterface;

    await this.openPage();
    const login = await this.login();

    if (login) {
      result = await this.getProfilesList(keyword, totalPages);

      if (result.success) {
        success = true;
      }
    }

    await this.closePage();

    reply.status(success ? 200 : 400).send(result);
  }
}

export default ScrapperController;

interface ProfileSearchListByPageInterface {
  lastPage?: number;
  profileList?: string[];
  success: boolean;
  totalResults?: number;
}
