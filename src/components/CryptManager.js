import crypto from "crypto";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";

class CryptManager {
  /**
   * Encripta un dato utilizando bcrypt.
   * @static
   * @async
   * @param {Object} options - Opciones para la encriptación.
   * @param {string} options.dato - Dato a encriptar.
   * @param {Number} [options.saltRounds=10] - Número de rondas para la generación de saltos para la encriptación con bcrypt, por defecto 10.
   * @returns {Promise<string>} - Dato encriptado.
   */
  static encriptar = async ({ dato, saltRounds = 10 }) => {
    try {
      const datoEncriptado = await bcrypt.hash(dato, saltRounds);
      return datoEncriptado;
    } catch (error) {
      console.error(error);
      return { error };
    }
  };

  /**
   * Compara un dato con un hash encriptado utilizando bcrypt.
   * @static
   * @async
   * @param {Object} options - Opciones para la comparación.
   * @param {string} options.dato - Dato a comparar.
   * @param {string} options.hash - Hash encriptado a comparar.
   * @returns {Promise<boolean>} - Resultado de la comparación (true si son iguales, false si no lo son).
   */
  static compararEncriptado = async ({ dato, hash }) => {
    try {
      const resultado = await bcrypt.compare(dato, hash);
      return resultado;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Genera una cadena aleatoria de caracteres hexadecimales.
   * @static
   * @param {Object} [options] - Opciones de la generación.
   * @param {number} [options.size=8] - Tamaño de la cadena generada.
   * @returns {string} - Cadena aleatoria de caracteres hexadecimales.
   */
  static generarRandom = ({ size = 8 } = {}) => {
    const random = crypto.randomBytes(8).toString("hex");
    const randomElement = random.slice(0, size);

    return randomElement;
  };

  /**
   * Encripta un dato utilizando el algoritmo AES y una llave predefinida.
   * @param {Object} options - Opciones para la encriptación.
   * @param {string} options.dato - El dato a encriptar.
   * @param {string} options.keyUncrypt - La llave para encriptar el dato.
   * @returns {string} El dato encriptado.
   */
  static encriptarConLlave = ({ dato, keyUncrypt }) => {
    const ciphertext = CryptoJS.AES.encrypt(dato, keyUncrypt).toString();

    return ciphertext;
  };

  /**
   * Desencripta un dato utilizando el algoritmo AES y una llave predefinida.
   * @param {Object} options - Opciones para la desencriptación.
   * @param {string} options.datoEncriptado - El dato a desencriptar.
   * @param {string} options.keyUncrypt - La llave para desencriptar el dato.
   * @returns {string} El dato desencriptado.
   */
  static desencriptarConLlave = ({ datoEncriptado, keyUncrypt }) => {
    const bytes = CryptoJS.AES.decrypt(datoEncriptado, keyUncrypt);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    return originalText;
  };
}

export default CryptManager;
