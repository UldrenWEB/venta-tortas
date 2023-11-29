import iSession from "../data/instances/iSession.js";
import iMailer from "../data/instances/iMailer.js";
import UserModel from "../models/userModel.js";
import CryptManager from "../components/CryptManager.js";
import { verifyAnswerQuestion } from "../schemas/userSchema.js";
/**
 * Clase que representa un controlador para la recuperación de datos de usuario.
 */
class olvidoDatosController {

  static #convertTextHTML = ({ content }) => {
    const data = `
    <div style="background-color: #f6f6f6; padding: 20px;">
      <h1 style="color: #FB5361;">¡Hola!</h1>
      <p style="color: #2c3e50;">Te hemos asignado una nueva contraseña para tu cuenta.</p>
      <p style="color: #2c3e50;">Tu nueva contraseña es: <strong>${content}</strong></p>
      <p style="color: #2c3e50;">¡Gracias!</p>
    </div>`
    return data
  }

  /**
   * Método privado para cambiar la contraseña del usuario y enviarla por correo electrónico.
   * @async
   * @param {Object} options - Las opciones para cambiar la contraseña.
   * @param {string} options.user - El nombre de usuario del usuario.
   * @param {string} options.randomPassword - La nueva contraseña generada aleatoriamente.
   * @param {string} options.emailUser - El correo electrónico del usuario.
   * @returns {Promise<boolean|Object>} True si la contraseña se cambió y se envió correctamente, de lo contrario, un objeto con un error.
   * @private
   */
  static #changePass = async ({ user, randomPassword, emailUser }) => {
    try {
      const result = await iMailer.sendMail({
        to: emailUser,
        subject: "Nueva contraseña",
        text: this.#convertTextHTML ({ content: randomPassword }),
      });
      if (result.error) return false;

      await UserModel.updatePassword({
        user,
        password: randomPassword,
      });
      return true;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Método privado para verificar si hay una sesión activa.
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {boolean} True si hay una sesión activa, de lo contrario, false.
   * @private
   */
  static #verifySession = (req, res) => {
    if (iSession.sessionExist(req))
      return res.json({
        error:
          "Tienes una sesion activa, debes desloguearte para poder recuperar los datos",
      });
    return false;
  };

  /**
   * Método privado para verificar si se han cargado las preguntas de seguridad.
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {boolean} True si se han cargado las preguntas de seguridad, de lo contrario, false.
   * @private
   */
  static #verifyQuestions = (req, res) => {
    if (!req.session.questions)
      return res.json({
        errorSession:
          "No estas solicitando recuperar los datos, por lo que no puedes acceder a esta ruta",
      });
    return false;
  };

  /**
   * Método privado para seleccionar dos preguntas de seguridad aleatorias.
   * @param {Object[]} options.preguntas - Las preguntas de seguridad disponibles.
   * @returns {Object[]|Object} Un arreglo con dos preguntas de seguridad seleccionadas aleatoriamente, o un objeto con un error si no hay preguntas disponibles.
   * @private
   */
  static #seleccionarDosPreguntas = ({ preguntas } = []) => {
    if (preguntas.length === 0)
      return { error: "No hay preguntas para seleccionar" };

    const index1 = Math.floor(Math.random() * preguntas.length);

    let index2 = Math.floor(Math.random() * preguntas.length);

    while (index2 === index1) {
      index2 = Math.floor(Math.random() * preguntas.length);
    }

    const result = [preguntas[index1], preguntas[index2]];
    return result;
  };

  /**
   * Método privado para verificar si las respuestas a las preguntas de seguridad son correctas.
   * @async
   * @param {Object} options - Las opciones para verificar las respuestas.
   * @param {Object[]} options.questions - Las preguntas de seguridad.
   * @param {Object[]} options.answers - Las respuestas a las preguntas de seguridad.
   * @returns {Promise<Object|undefined>} Un objeto con un error si una o ambas respuestas son incorrectas, de lo contrario, undefined.
   * @private
   */
  static #verifyAnswers = async ({ questions, answers }) => {
    try {
      const idQuestionMap = questions.map((question) => question.idquestion);
      const hashRespuestas = await UserModel.obtenerRespuestas({
        index: idQuestionMap,
      });

      for (const answer of answers) {
        const dato = answer.answer.toLowerCase();
        const validate =
          (await CryptManager.compararEncriptado({
            dato,
            hash: hashRespuestas[0].de_answer,
          })) ||
          (await CryptManager.compararEncriptado({
            dato,
            hash: hashRespuestas[1].de_answer,
          }));

        if (!validate) {
          return { error: "Una o ambas respuestas son incorrectas" };
        }
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Método privado para indicar que no se enviaron las respuestas a las preguntas de seguridad o se enviaron en un formato incorrecto.
   * @returns {Object} Un objeto con un error y un ejemplo de cómo enviar las respuestas correctamente.
   * @private
   */
  static #notAnswers = () => {
    return {
      error:
        "No se enviaron las respuestas o se enviaron en formato incorrecto",
      example: {
        answers: [{ answer: "Respuesta 1" }, { answer: "Respuesta 2" }],
      },
    };
  };

  /**
   * Endpoint GET para la recuperación de datos de usuario.
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Object} - Objeto de respuesta HTTP con el mensaje de bienvenida.
   */
  static getOlvidoDatos = (req, res) => {
    if (this.#verifySession(req, res)) return;

    return res.json({
      message:
        "Estas en el GET para recuperar los datos, envia el username a recuperar con el metodoo POST",
    });
  };

  /**
   * Endpoint POST para la recuperación de datos de usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto de respuesta HTTP con redireccion o error.
   */
  static postOlvidoDatos = async (req, res) => {
    try {
      if (this.#verifySession(req, res)) return;

      const { user } = req.body;

      const verifyUser = await UserModel.verifyUser({ user });
      if (!verifyUser) return res.json({ error: "El usuario no existe" });

      const verifyBlock = await UserModel.verifyBlock({ user });
      if (verifyBlock) return res.json({ error: "El usuario esta bloqueado" });

      const infoUser = { questions: [], user };
      iSession.createSesion({ req, infoUser });

      return res.redirect(303, "/olvidoDatos/cargarPreguntas");
    } catch (error) {
      return { error };
    }
  };

  /**
   * Endpoint GET para cargar las preguntas de seguridad.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto HTTP con la informacion.
   */
  static getCargarPreguntas = async (req, res) => {
    try {
      if (this.#verifySession(req, res)) return;
      if (this.#verifyQuestions(req, res)) return;

      const { user } = req.session;
      const preg = await UserModel.cargarPreguntas({ user });

      const preguntas = this.#seleccionarDosPreguntas({ preguntas: preg });
      req.session.questions = preguntas;

      const questions = preguntas.map((pregunta) => {
        const obj = { question: pregunta.question };
        return obj;
      });

      const objInfo = {
        message: "Responde las preguntas de seguridad usando el POST",
        questions,
      };

      return res.json(objInfo);
    } catch (error) {
      return { error };
    }
  };

  /**
   * Endpoint POST para cargar las respuestas a las preguntas de seguridad y cambiar la contraseña del usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto HTTP con la informacion.
   */
  static postCargarPreguntas = async (req, res) => {
    try {
      if (this.#verifySession(req, res)) return;
      if (this.#verifyQuestions(req, res)) return;

      const { user, questions } = req.session;
      const { answers } = req.body;

      if (!answers) return res.json(this.#notAnswers());

      const answerSchema = await verifyAnswerQuestion({ answer: answers });
      if (answerSchema?.error) return res.json(answerSchema);

      const verifyAnswers = await this.#verifyAnswers({ questions, answers });
      if (verifyAnswers?.error) return res.json(verifyAnswers);

      iSession.destroySessionRecovery(req);

      const randomPassword = CryptManager.generarRandom();

      const emailUser = await UserModel.getMail({ user });

      const change = await this.#changePass({
        user,
        randomPassword,
        emailUser,
      });
      if (!change)
        return res.json({
          error: "Ha ocurrido un error al cambiar la pass o enviar el correo",
        });

      return res.json({
        messageSucess: "Se ha enviado un correo con la contraseña",
      });
    } catch (error) {
      return res.json({
        error: "Error en el servidor",
        messageError: error.message,
      });
    }
  };

  /**
   * Endpoint GET para desbloquear un usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto HTTP con la informacion.
   */
  static getDesbloquear = async (req, res) => {
    if (this.#verifySession(req, res)) return;

    return res.json({
      message:
        "Estas en el GET para desbloquear, envia el username a desbloquear con el metodo POST de la siguiente manera:",
      example: {
        user: "username",
      },
    });
  };

  /**
   * Endpoint POST para desbloquear un usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto HTTP con la informacion.
   */
  static postDesbloquear = async (req, res) => {
    try {
      if (this.#verifySession(req, res)) return;
      const { user } = req.body;

      if (!user) return res.json({ error: "No ingreso usuario" });

      if (!(await UserModel.verifyUser({ user })))
        return res.json({ error: "El usuario no existe" });

      if (!(await UserModel.verifyBlock({ user })))
        return res.json({ error: `El usuario ${user} no esta bloqueado` });

      const infoUser = { questions: [], user };
      iSession.createSesion({ req, infoUser });

      return res.redirect(303, "/olvidoDatos/cargarPreguntas");
    } catch (error) {
      return res.json({ error: `Ha ocurrido un error, ${error.message}` });
    }
  };

  /**
   * Endpoint POST para cargar las respuestas a las preguntas de seguridad y desbloquear un usuario.
   * @async
   * @param {Object} req - El objeto de solicitud.
   * @param {Object} res - El objeto de respuesta.
   * @returns {Promise<Object>} - Objeto HTTP con la informacion.
   */
  static postDesbloquearCargarPreguntas = async (req, res) => {
    try {
      if (this.#verifySession(req, res)) return;
      if (this.#verifyQuestions(req, res)) return;

      const { user, questions } = req.session;
      const { answers } = req.body;

      if (!answers) return res.json(this.#notAnswers());

      const answerSchema = await verifyAnswerQuestion({ answer: answers });
      if (answerSchema?.error) return res.json(answerSchema);

      const verifyAnswers = await this.#verifyAnswers({ questions, answers });
      if (verifyAnswers?.error) return res.json(verifyAnswers);

      iSession.destroySessionRecovery(req);

      const result = await UserModel.desbloquear({ user });
      if (result?.error) res.send({ error: "Error al desbloquear" });

      return res.send({ message: "Usuario desbloqueado, vuelva a ingresar" });
    } catch (error) {
      return { error };
    }
  };

  
}

export default olvidoDatosController;
