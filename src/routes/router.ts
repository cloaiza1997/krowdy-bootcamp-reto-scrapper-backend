import fastify from "fastify";
import fastifyCors from "fastify-cors";
import ProfileController from "../controllers/profile.controller";
import ScrapperController from "../controllers/scrapper.controller";

const fast = fastify({ logger: true });

fast.register(fastifyCors, {
  origin: [
    "https://krowdy-bootcamp-reto-scrapper-frontend.vercel.app",
    "http://localhost:3000",
  ],
  methods: ["POST", "GET", "DELETE"],
});

fast.get("/", async () => {
  return "API Linkedin Scrapper";
});

fast.post("/scrap/profiles", (request, reply) =>
  ScrapperController.scrapLinkedin(request, reply)
);

fast.get("/profiles", (request, reply) =>
  ProfileController.getProfileList(request, reply)
);

fast.delete("/profiles", (request, reply) =>
  ProfileController.deleteAllProfiles(request, reply)
);

export { fast };
