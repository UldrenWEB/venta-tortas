import UserModel from "../models/userModel.js";

/**
 * Clase que representa un controlador para establecer el perfil de usuario.
 */
class setProfileController {
  /**
   * Obtiene los perfiles disponibles para el usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} El objeto JSON con los perfiles disponibles o un mensaje de error.
   */
  static getProfiles = async (req, res) => {
    try {
      const { user } = req.session;
      const profiles = await UserModel.getProfiles({ user });


      const profilesMap = profiles.map((e) => e.de_profile);

      console.log(profilesMap)
      req.session.profiles = profilesMap;

      if (profilesMap.length === 1) {
        return this.#putProfile(req, res, profilesMap[0]);
      }

      const objSend = {
        message: "Selecciona uno de los perfiles disponibles",
        profiles: profilesMap,
      };
      return res.json(objSend);
    } catch (error) {
      return { error };
    }
  };

  /**
   * Establece el perfil seleccionado por el usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} El objeto JSON con el mensaje de éxito o error.
   */
  static setProfile = async (req, res) => {
    try {
      const { profiles } = req.session;
      const { profile } = req.body;

      if (profiles.includes(profile)) {
        return this.#putProfile(req, res, profile);
      }
      return res.json({
        error: "El perfil seleccionado no es valido o ocurrio un error",
      });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Establece el perfil seleccionado por el usuario.
   * @private
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @param {string} profile - El perfil seleccionado por el usuario.
   * @returns {Object} El objeto JSON con el mensaje de éxito o error.
   */
  static #putProfile = (req, res, profile) => {
    const { user } = req.session;
    if (UserModel.hasProfile({ user, profile })) {
      delete req.body.profiles;
      req.session.profile = profile;
      return res.redirect(303, "/home");
    }
    return res.json({ error: "El perfil seleccionado no es valido" });
  };
}

export default setProfileController;