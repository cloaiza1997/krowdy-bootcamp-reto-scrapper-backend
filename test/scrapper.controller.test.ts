import { expect } from "chai";
import ScrapperController from "../src/controllers/scrapper.controller";

before(async () => {
  await ScrapperController.openPage();
});

after(async () => {
  await ScrapperController.closePage();
});

describe("LINKEDIN SCRAPPER CONTROLLER TEST", async () => {
  it("Login", async () => {
    const success = await ScrapperController.login({ isScrapper: true });

    expect(success).equal(true);
  });

  it("Get profiles", async () => {
    const profileList = await ScrapperController.getLinkedInProfilesByList([
      "https://www.linkedin.com/in/bank-test-180845236/",
      "https://www.linkedin.com/in/cristian-andrés-loaiza-arias-375a82140",
    ]);

    expect(profileList.length).equal(2);
  });

  it("Logout", async () => {
    await ScrapperController.logout();
  });
});
