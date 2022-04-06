import "dotenv/config";
import {
  LINKEDIN_SELECTORS,
  LINKEDIN_BASE_PATH,
  LINKEDIN_PAGE_ELEMENTS_TEXT,
  LINKEDIN_URL_SEARCH_PEOPLE,
} from "../shared/utils/consts";
import { homologateString } from "../shared/utils/functions";
import PuppeteerController from "./puppeteer.controller";

const {
  LINKEDIN_LOGIN_USERNAME,
  LINKEDIN_LOGIN_PASSWORD,
  LINKEDIN_SCRAPPER_USERNAME,
  LINKEDIN_SCRAPPER_PASSWORD,
} = process.env;

const { homeTitle, searchTitle } = LINKEDIN_PAGE_ELEMENTS_TEXT;
const { login, search } = LINKEDIN_SELECTORS;
const { pagination, list, profileInfo } = search;

class ScrapperController extends PuppeteerController {
  /**
   * Inicia la sesión en linkedin
   * @param {object} options
   * @param {boolean} options.isScrapper Flag para utilizar las credenciales del usuario para realizar scrapper de perfiles
   */
  static async login({ isScrapper = false }: { isScrapper: boolean }) {
    await this.goTo(LINKEDIN_BASE_PATH);
    await this.page.waitForSelector("input");

    const usernameInput = await this.getElementByQuerySelector(login.username);
    const passwordInput = await this.getElementByQuerySelector(login.password);

    await this.typeInput(
      usernameInput,
      isScrapper ? LINKEDIN_SCRAPPER_USERNAME : LINKEDIN_LOGIN_USERNAME
    );
    await this.typeInput(
      passwordInput,
      isScrapper ? LINKEDIN_SCRAPPER_PASSWORD : LINKEDIN_LOGIN_PASSWORD
    );

    await passwordInput?.press("Enter");

    await this.waitForNav();

    const title = await this.getPageTitle();

    const success = title.includes(homeTitle);

    return success;
  }

  /**
   * Consulta un perfil individual de linkedin
   * @param {string} profileLink Url del perfil a consultar
   */
  static async getLinkedInProfile(profileLink: string) {
    await this.goTo(profileLink);
    await this.page.waitForSelector(profileInfo.name);
    await this.scrollingDown();

    const profile: any = {};

    // Información
    profile.avatar = await this.getAttributeByXPath(profileInfo.avatar, "src");
    profile.name = await this.getTextContentByQuerySelector(profileInfo.name);
    profile.position = await this.getTextContentByXPath(profileInfo.position);
    profile.location = await this.getTextContentByXPath(profileInfo.location);

    // Apertura del diálogo de información de contacto
    const [buttonContactInfo] = await this.getElementByXPath(
      profileInfo.buttonContactInfo
    );
    await buttonContactInfo.click();
    await this.page.waitForSelector(profileInfo.dialogContactInfo);

    const websites = this.getElementByXPath(profileInfo.websites);

    profile.websites = await Promise.all(
      (
        await websites
      ).map(
        async (elementHandle) =>
          await this.getElementAttribute(elementHandle, "href")
      )
    );

    profile.linkeding = profileLink;
    profile.phone = await this.getTextContentByXPath(profileInfo.phone);
    profile.address = await this.getTextContentByXPath(profileInfo.address);
    profile.email = await this.getTextContentByXPath(profileInfo.email);

    return profile;
  }

  /**
   * Consulta los perfiles con base en el listado de urls
   * @param {Array<string>}profileUrlList
   */
  static async getLinkedInProfilesByList(profileUrlList: string[] = []) {
    const profileList = [];

    for (let i = 0; i < profileUrlList.length; i += 1) {
      const url = profileUrlList[i];

      const profile = await this.getLinkedInProfile(url);

      profileList.push(profile);
    }

    return profileList;
  }

  /**
   * Realiza la consulta de las páginas de búsqueda de acuerdo con el total de páginas
   * @param keyword Palabra a buscar
   * @param totalPages Total de página a recorrer
   * @returns
   */
  static async getProfilesList(keyword: string, totalPages: number = 3) {
    let errorPages = [];
    let profilesUrlList: string[] = [];
    let result!: ProfileSearchListByPageInterface;

    // Se consulta página por página de acuerdo con el límite total
    for (let i = 0; i < totalPages; i += 1) {
      const page = i + 1;

      result = await this.getProfileSearchListByPage(keyword, page);

      const { success, lastPage = 0 } = result;

      if (success) {
        profilesUrlList = profilesUrlList.concat(result.profilesUrlList || []);
      } else {
        errorPages.push(page);
      }

      if (page + 1 > lastPage) {
        break;
      }
    }

    return { ...result, profilesUrlList, errorPages };
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

    const profilesUrlList: string[] = [];

    // Se extrae de cada elemento el enlace al perfil
    await Promise.all(
      profilesListHandler.map(async (profileInfo) => {
        const href = await this.getElementAttribute(profileInfo, "href");

        if (href) {
          profilesUrlList.push(href.split("?")[0]);
        }

        return href;
      })
    );

    return {
      success: true,
      totalResults,
      lastPage,
      profilesUrlList,
    };
  }

  /**
   * Realiza el scrapping de perfiles de linkedin
   */
  static async scrapLinkedin(
    { body: { keyword, totalPages } }: any,
    reply: any
  ) {
    // Inicio de sesión 1
    await this.openPage();
    const login = await this.login({ isScrapper: false });

    if (!login) {
      await this.closePage();

      return reply
        .status(400)
        .send({ status: false, message: "Error al iniciar sesión" });
    }

    // Búsqueda de perfiles
    let result!: ProfileSearchListByPageInterface;
    result = await this.getProfilesList(keyword, totalPages);

    await this.closePage();

    if (!result.success) {
      return reply.status(400).send({
        status: false,
        message: "Error al realizar la búsqueda",
      });
    }

    // Inicio de sesión 2
    await this.openPage();
    const loginScrapper = await this.login({ isScrapper: true });

    if (!loginScrapper) {
      await this.closePage();

      return reply.status(400).send({
        status: false,
        message: "Error al iniciar sesión para realizar el scrapper",
      });
    }

    // Consulta de perfiles individuales
    const profileList = await this.getLinkedInProfilesByList(
      result.profilesUrlList
    );

    await this.closePage();

    return reply.status(200).send({ ...result, profileList });
  }
}

export default ScrapperController;

interface ProfileSearchListByPageInterface {
  lastPage?: number;
  profilesUrlList?: string[];
  success: boolean;
  totalResults?: number;
}
