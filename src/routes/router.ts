import fastify from "fastify";
import fastifyCors from "fastify-cors";
import ScrapperController from "../controllers/scrapper.controller";

const fast = fastify({ logger: true });

fast.register(fastifyCors, {
  origin: "*",
  methods: ["POST", "GET"],
});

fast.get("/", async () => {
  return "API Linkedin Scrapper";
});

fast.post("/scrap/profiles", (request, reply) =>
  ScrapperController.scrapLinkedin(request, reply)
);

export { fast };
