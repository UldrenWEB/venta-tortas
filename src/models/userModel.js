/**
 * @file Modelo de usuarios de la aplicación.
 * @name UserModel.js
 */
import iManagerPgHandler from "../data/instances/iManagerPgHandler.js";
import CryptManager from "../components/CryptManager.js";

/**
 * Clase que representa el modelo de manejo de usuarios de la aplicación.
 * @class
 */
class UserModel {
  /**
   * Método estático que verifica si un usuario existe en la base de datos.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise<Object|boolean>} Una promesa que resuelve con el resultado de la consulta a la base de datos.
   */
  static verifyUser = async ({ user }) => {
    try {
      const result = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "id_user",
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que verifica si un usuario está bloqueado o ha excedido el número de intentos de inicio de sesión fallidos.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise<boolean>} Una promesa que resuelve con un valor booleano que indica si el usuario está desbloqueado o no.
   */
  static verifyBlock = async ({ user }) => {
    try {
      const isBlock = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "bl_user",
      });

      const attemps = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "at_user",
      });

      return isBlock || attemps <= 0;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que verifica si la contraseña de un usuario es correcta.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @param {string} params.password - La contraseña del usuario.
   * @returns {Promise<boolean>} Una promesa que resuelve con un valor booleano que indica si la contraseña es correcta o no.
   */
  static verifyPassword = async ({ user, password }) => {
    try {
      const pass = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "pw_user",
      });

      const result = await CryptManager.compararEncriptado({
        dato: password.toString(),
        hash: pass,
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que restaura el número de intentos de inicio de sesión fallidos de un usuario.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise<Object[]>} Una promesa que resuelve con el resultado de la consulta a la base de datos.
   */
  static restoreIntentos = async ({ user }) => {
    try {
      const result = await iManagerPgHandler.executeMethod({
        key: "restoreIntentos",
        params: [user],
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que verifica el número de intentos de inicio de sesión fallidos de un usuario.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise<Object>} Una promesa que resuelve con el número de intentos de inicio de sesión fallidos de un usuario.
   */
  static verifyIntentos = async ({ user }) => {
    try {
      const result = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "at_user",
      });

      if (!result) return 0;

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que disminuye el número de intentos de inicio de sesión fallidos de un usuario.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise} Una promesa que resuelve con el resultado de la consulta a la base de datos.
   */
  static disminuirIntentos = async ({ user }) => {
    try {
      const intentos = await this.verifyIntentos({ user });
      if (intentos.at_user <= 0) return;

      const result = await iManagerPgHandler.execute({
        key: "disminuirIntentos",
        params: [user],
      });
      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que desbloquea el acceso de un usuario a la aplicación.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise} Una promesa que resuelve con el resultado de la consulta a la base de datos.
   */
  static desbloquear = async ({ user }) => {
    try {
      const result = await iManagerPgHandler.execute({
        key: "desbloquear",
        params: [user],
      });
      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que bloquea el acceso de un usuario a la aplicación.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @returns {Promise} Una promesa que resuelve con el resultado de la consulta a la base de datos.
   */
  static bloquear = async ({ user }) => {
    try {
      const result = await iManagerPgHandler.execute({
        key: "bloquear",
        params: [user],
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método estático que retorna los datos de sesión de un usuario.
   * @static
   * @async
   * @function
   * @param {Object} params - Los parámetros de entrada del método.
   * @param {string} params.user - El nombre de usuario del usuario.
   * @param {string} params.password - La contraseña del usuario.
   * @returns {Promise} Una promesa que resuelve con los datos de sesión de un usuario.
   */
  static retornarDatos = async ({ user, password }) => {
    try {
      if (!(await this.verifyPassword({ user, password }))) return false;

      const [result] = await iManagerPgHandler.executeQuery({
        key: "getDataSession",
        params: [user],
      });

      const data = {
        idUser: result.id_user,
        user: result.na_user,
        email: result.ma_user,
      };

      return data;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Carga todas las preguntas de un usuario.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.user - Nombre de usuario.
   * @returns {Promise<Array>} - Promesa que resuelve en un array de preguntas.
   */
  static cargarPreguntas = async ({ user }) => {
    try {
      const preguntas = await iManagerPgHandler.executeQuery({
        key: "cargarTodasPreguntas",
        params: [user],
      });

      return preguntas;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Obtiene las respuestas de dos preguntas.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {Array<number>} options.index - Índices de las preguntas.
   * @returns {Promise<Array>} - Promesa que resuelve en un array de respuestas.
   */
  static obtenerRespuestas = async ({ index = [] }) => {
    try {
      const respuestas = await iManagerPgHandler.executeQuery({
        key: "obtenerDosRespuestas",
        params: [...index],
      });

      return respuestas;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Actualiza la contraseña de un usuario.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.user - Nombre de usuario.
   * @param {string} options.password - Nueva contraseña.
   * @returns {Promise<Object>} - Promesa que resuelve en un objeto con el resultado de la consulta.
   */
  static updatePassword = async ({ user, password }) => {
    try {
      const hashedPass = await CryptManager.encriptar({ dato: password });
      const result = await iManagerPgHandler.execute({
        key: "updatePassword",
        params: [hashedPass, user],
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Obtiene el correo electrónico de un usuario.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.user - Nombre de usuario.
   * @returns {Promise<string>} - Promesa que resuelve en el correo electrónico del usuario.
   */
  static getMail = async ({ user }) => {
    try {
      const mail = await iManagerPgHandler.returnByProp({
        key: "selectUserUs",
        params: [user],
        prop: "ma_user",
      });

      return mail;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Obtiene los perfiles de un usuario.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.user - Nombre de usuario.
   * @returns {Promise<Array>} - Promesa que resuelve en un array de perfiles.
   */
  static getProfiles = async ({ user }) => {
    try {
      const profiles = await iManagerPgHandler.executeQuery({
        key: "getProfiles",
        params: [user],
      });

      return profiles;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si un usuario tiene un perfil específico.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.user - Nombre de usuario.
   * @param {string} options.profile - Nombre del perfil.
   * @returns {Promise<boolean>} - Promesa que resuelve en un booleano que indica si el usuario tiene el perfil.
   */
  static hasProfile = async ({ user, profile }) => {
    try {
      const result = await iManagerPgHandler.returnByProp({
        key: "hasProfile",
        params: [user, profile],
        prop: "id_profile",
      });
      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Ejecuta un query de la clase `iPgHandler` con los parámetros especificados.
   * @async
   * @static
   * @param {Object} options - Opciones de la consulta.
   * @param {string} options.method - Nombre del método a ejecutar.
   * @param {Object} options.params - Parámetros del método.
   * @returns {Promise<Object>} - Promesa que resuelve en el resultado de la consulta.
   */
  static executeMethod = async ({ method, params }) => {
    //*Importante, los params deben estar ordenados, tal cual como estan en el archivo de querys para que funcione
    //*El query debe llamarse igual al metodo para que funcione
    try {
      const parametros = [];
      for (const key in params) {
        parametros.push(params[key]);
      }

      const result = await iManagerPgHandler.executeQuery({
        key: method,
        params: parametros,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };
}

export default UserModel;
