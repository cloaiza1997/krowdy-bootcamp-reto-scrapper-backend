import mongoose from "mongoose";
import { dbProfile } from "../services/database";

const ProfileSchema = new mongoose.Schema({
  avatar: { type: String },
  name: { type: String, required: true },
  position: { type: String },
  location: { type: String },
  websites: { type: [{ type: String }], default: [] },
  linkedin: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
});

const ProfileModel = dbProfile.model("profile", ProfileSchema);

export default ProfileModel;
