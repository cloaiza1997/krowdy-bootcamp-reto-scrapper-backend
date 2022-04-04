import { expect } from "chai";
import ScrapperController from "../src/controllers/scrapper.controller";
import Response from "../src/shared/models/Response";

before(async () => {
  await ScrapperController.openPage();
});

after(async () => {
  await ScrapperController.closePage();
});

describe("LINKEDIN SCRAPPER TEST", async () => {
  it("Login", async () => {
    const response = await ScrapperController.login();

    expect(response).equal(true);
  });
});
