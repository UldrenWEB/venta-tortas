import iSecurity from "../data/instances/iSecurity.js";
import iSession from "../data/instances/iSession.js";

/**
 * Clase que representa un controlador para la página de inicio.
 */
class HomeController {

  /**
   * Obtiene la página de inicio.
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Object} El objeto JSON con el mensaje de éxito o error.
   */
  static getHome = (req, res) => {
    try {
      if (!iSession.sessionExist(req))
        return res.json({ error: "No hay una sesion iniciada" });

      const { profile } = req.session;
      const infoProfile = iSecurity.permissions.get(profile);

      const json = {
        userProfile: profile,
        message: `Estos son los metodos que tienes disponibles con el perfil que iniciaste, con /toProcess puedes ejecutarlos`,
        permissions: infoProfile,
        profileData: req.session
      };

      return res.json(json);
    } catch (error) {
      return { error };
    }
  };
}

export default HomeController;