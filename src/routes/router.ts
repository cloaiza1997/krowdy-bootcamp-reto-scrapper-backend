import fastify from "fastify";
import fastifyCors from "fastify-cors";

const fast = fastify({ logger: true });

fast.register(fastifyCors, {
  origin: "*",
  methods: ["POST", "GET"],
});

fast.get("/", async () => {
  return "API Linkedin Scrapper";
});

export { fast };
