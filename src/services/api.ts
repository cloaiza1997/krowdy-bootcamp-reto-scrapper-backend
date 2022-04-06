import { fast } from "../routes/router";

const start = async () => {
  try {
    console.log(process.env);
    // En heroku no se puede definir el puerto directamente y cambiar el localhost a 0.0.0.0
    // await fast.listen(process.env.PORT || 5000, "localhost");
    await fast.listen(process.env.PORT || 5000, "0.0.0.0");
  } catch (error) {
    fast.log.error(error);
    process.exit(1);
  }
};

const end = async () => {
  await fast.close();
};

export { start, end };
