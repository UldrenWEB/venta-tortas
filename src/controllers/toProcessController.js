import iSecurity from "../data/instances/iSecurity.js";

/**
 * Clase que representa un controlador para ejecutar métodos de diferentes áreas y objetos.
 */
class ToProcessController {
  /**
   * Ejecuta un método de un objeto de una determinada área.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} El objeto JSON con el resultado de la ejecución del método o un mensaje de error.
   */
  static toProcessPost = async (req, res) => {
    try {
      const { profile } = req.session;
      const { area, method, object, params } = req.body;
      if(!area || !method || !object) return res.json({ error: "Faltan datos para ejecutar el método" });

      const permiso = await iSecurity.hasPermission({
        profile,
        area,
        object,
        method,
      });

      if (permiso) {
        const resultMethod = await iSecurity.executeMethod({
          area,
          object,
          method,
          params,
        });

        return res.json(resultMethod);
      } else {
        return res.json({ error: "No tienes permiso para ejecutar este método" });
      }
    } catch (error) {
      return res.json({ error });
    }
  };

 /**
   * Controlador del metodo GET de /toProcess.
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Object} El objeto JSON con el mensaje de informacion.
   */
  static toProcessGet = (req, res) => {
    return res.json({message: "Estas en el GET de /toProcess, usa el POST para ejecutar metodos"})
  }
}

export default ToProcessController;