import { fast } from "../routes/router";

const start = async () => {
  try {
    // En heroku no se puede definir el puerto directamente y cambiar el localhost a 0.0.0.0
    await fast.listen(process.env.PORT || 5000, "localhost");
  } catch (error) {
    fast.log.error(error);
    process.exit(1);
  }
};

export default start;
