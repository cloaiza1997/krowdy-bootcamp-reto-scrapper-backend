import mongoose from "mongoose";
import ProfileModel from "../models/profile.model";

const {
  Types: { ObjectId },
} = mongoose;

class ProfileController {
  /**
   * Crea nuevos perfiles o actualiza los perfiles ya existentes mediante el correo
   */
  async createManyProfiles(profileList: any[]) {
    let _profileList = [...profileList];

    // Se extraen los correos
    const profileLinkedInUrlList = profileList.map(
      (profile) => profile.linkedin
    );

    // Se busca si ya existen perfiles con de acuerdo con los correos de los nuevos perfiles
    let profiles: any[] = await ProfileModel.find({
      linkedin: profileLinkedInUrlList,
    });

    // Se actualizan las propiedades de los perfiles existentes
    const profilesToUpdate = profiles.map(({ _doc: profile }: any) => {
      // En cada iteración se busca el perfil existente en el listado de nuevos perfiles
      const index = _profileList.findIndex(
        (_profile) => _profile.linkedin === profile.linkedin
      );

      const newProfile = {
        ...profile,
        ..._profileList[index],
      };

      delete newProfile.__v;

      // Se remueve el perfil procesado
      _profileList.splice(index, 1);

      return newProfile;
    });

    // + Se actualizan los perfiles existentes
    if (profilesToUpdate.length > 0) {
      const bulkProfileOperator =
        ProfileModel.collection.initializeUnorderedBulkOp();

      for (const profile of profilesToUpdate) {
        bulkProfileOperator
          .find({
            _id: profile._id,
          })
          .updateOne({ $set: profile });
      }

      await bulkProfileOperator.execute();
    }

    // + Se crean nuevos perfiles
    if (_profileList.length > 0) {
      await ProfileModel.insertMany(_profileList);
    }
  }

  /**
   * Elimina perfiles
   */
  static async deleteAllProfiles(request: any, reply: any) {
    await ProfileModel.deleteMany({});

    return reply.status(200).send({ success: true });
  }

  /**
   * Listado de perfiles
   */
  static async getProfileList(request: any, reply: any) {
    const profileList = await ProfileModel.find({});

    return reply.status(200).send({ success: true, profileList });
  }
}

export default ProfileController;
