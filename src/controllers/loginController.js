import UserModel from "../models/userModel.js";
import iSession from "../data/instances/iSession.js";

/**
 * Controlador para el inicio de sesión de usuarios.
 */
class LoginController {
  /**
   * Verifica si los datos de inicio de sesión son válidos.
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {void}
   */
  static verifyData = (req, res) => {
    const { user, password } = req.body;
    if (!user || !password)
      return res
        .status(400)
        .json({ error: "Faltan datos para ingresar sesión" });
  };

  /**
   * Verifica si el usuario existe en la base de datos.
   * @async
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Promise<Object>} - Objeto de respuesta HTTP con el resultado de la operación.
   */
  static verifyUser = async (req, res) => {
    try {
      const { user } = req.body;
      const userExist = await UserModel.verifyUser({ user });
      if (!userExist)
        return res.status(404).json({ error: "Usuario no existe" });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si el usuario está bloqueado.
   * @async
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Promise<Object>} - Objeto de respuesta HTTP con el resultado de la operación.
   */
  static verifyBlock = async (req, res) => {
    try {
      const userBlocked = await UserModel.verifyBlock({ user: req.body.user });
      if (userBlocked)
        return res.status(404).json({ message: "Usuario bloqueado" });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si la contraseña es correcta.
   * @async
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {Promise<Object>} - Objeto de respuesta HTTP con el resultado de la operación.
   */
  static verifyPassword = async (req, res) => {
    try {
      const { user, password } = req.body;
      const passwordCorrect = await UserModel.verifyPassword({
        user,
        password,
      });

      if (!passwordCorrect) {
        await UserModel.disminuirIntentos({ user });
        const intentos = await this.obtenerIntentos({
          req,
        });

        if (intentos === 0) return await this.bloquear(req, res);
        return res.status(400).json({
          error: `Contraseña incorrecta, te quedan ${intentos} intentos`,
        });
      }
    } catch (error) {
      return { error };
    }
  };

  /**
   * Bloquea a un usuario en la base de datos.
   * @async
   * @static
   * @param {Object} req - Objeto de solicitud HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {string} req.body.user - Nombre de usuario a bloquear.
   * @returns {Promise<Object>} - Promesa que resuelve en un objeto con el resultado de la consulta.
   */
  static bloquear = async (req, res) => {
    try {
      const { user } = req.body;
      await UserModel.bloquear({ user });
      return res.status(400).json({ error: "Usuario bloqueado" });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Obtiene el número de intentos restantes para iniciar sesión.
   * @async
   * @param {Object} req - Objeto de petición HTTP.
   * @returns {Promise<number>} - Número de intentos restantes.
   */
  static obtenerIntentos = async ({ req }) => {
    try {
      const { user } = req.body;
      const intentos = await UserModel.verifyIntentos({ user });

      return intentos;
    } catch (error) {
      return { error };
    }
  };

  //* Desde aqui se manejan los middlewares.

  /**
   * Middleware para verificar si el usuario está autenticado.
   * @async
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @param {Function} next - Función para pasar al siguiente middleware.
   * @returns {Promise<Object>} - Objeto de respuesta HTTP con el resultado de la operación.
   */
  static midAuth = async (req, res, next) => {
    try {
      if (req.method === "GET") return next();
      if (iSession.sessionExist(req)) return res.redirect(303, "/home");
      if (this.verifyData(req, res)) return;
      if (await this.verifyUser(req, res)) return;
      if (await this.verifyBlock(req, res)) return;
      if (await this.verifyPassword(req, res)) return;
      return next();
    } catch (error) {
      console.error(
        `Ocurrio un error en el middleware ${error.message} midAuth del archivo loginController.js`
      );
      return { error: error.message };
    }
  };

  //* Desde aqui se manejan los endpoints desde los routers.

  /**
   * Maneja la petición POST para iniciar sesión.
   * @param {Object} req - Objeto de petición HTTP.
   * @param {Object} res - Objeto de respuesta HTTP.
   * @returns {void}
   */
  static loginPost = async (req, res) => {
    try {
      const { user, password } = req.body;
      await UserModel.restoreIntentos({ user });

      const datos = await UserModel.retornarDatos({
        user,
        password,
      });

      const infoUser = {
        idUser: datos.idUser,
        user: datos.user,
        email: datos.email,
      };

      return iSession.createSesion({ req, infoUser })
        ? res.redirect(303, "/setProfile")
        : res.status(400).json({
            error: `No se pudo crear la sesión para ${infoUser.user}`,
          });
    } catch (error) {
      return { error };
    }
  };

  static loginGet = (req, res) => {
    return res.json({
      message:
        "Esta es el endpoint para loguear, pero estas usando GET, usa POST para enviar los datos",
    });
  };
}

export default LoginController;
