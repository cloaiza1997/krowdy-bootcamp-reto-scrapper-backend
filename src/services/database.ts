import mongoose from "mongoose";
import "dotenv/config";

const dbProfile = mongoose.createConnection(
  process.env.MONGODB_ADDON_URI || ""
);

export { dbProfile };
